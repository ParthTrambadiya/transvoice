const url = window.location.href
const replacedURL = url.replace('#', '&')
const finalURL = new URLSearchParams(replacedURL)
var accessToken = finalURL.get('access_token')
var idToken = finalURL.get("id_token")
var expiresIn = finalURL.get('expires_in')
var tokenType = finalURL.get('token_type')
var UserID, UserName, UserEmail;
var no_of_output;

if(sessionStorage.getItem('accessToken') == null && sessionStorage.getItem('idToken') == null)
{
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('idToken', idToken);
    sessionStorage.setItem('expiresIn', expiresIn);
    sessionStorage.setItem('tokenType', tokenType);
}

document.getElementById('uploadPage').href="upload.html#access_token=" + sessionStorage.getItem('accessToken') + 
                                                        "&id_token=" + sessionStorage.getItem('idToken') +
                                                        "&expires_in=" + sessionStorage.getItem('expiresIn') +
                                                        "&token_type=" + sessionStorage.getItem('tokenType');

document.getElementById('transcribePage').href="transcribe.html#access_token=" + sessionStorage.getItem('accessToken') + 
                                                        "&id_token=" + sessionStorage.getItem('idToken') +
                                                        "&expires_in=" + sessionStorage.getItem('expiresIn') +
                                                        "&token_type=" + sessionStorage.getItem('tokenType');

document.getElementById('downloadPage').href="download.html#access_token=" + sessionStorage.getItem('accessToken') + 
                                                        "&id_token=" + sessionStorage.getItem('idToken') +
                                                        "&expires_in=" + sessionStorage.getItem('expiresIn') +
                                                        "&token_type=" + sessionStorage.getItem('tokenType');

var params = {
    AccessToken:  accessToken/* required */
};

aws_region = 'us-east-1';
identityPoolID = 'us-east-1:270834b8-dd6e-4d6b-8781-f3dffb0c4313';
AWS.config.region = aws_region;
AWS.config.apiVersions = {
    cognitoidentityserviceprovider: '2016-04-18'
};

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
cognitoidentityserviceprovider.getUser(params, function(err, data) {
    if (err)
    {
        window.location.href = 'https://parthtrambadiya.github.io/sgp-6'
    }
    else 
    {
        console.log(data.UserAttributes);
        for(var i = 0; i < data.UserAttributes.length; i++)
        {
            if(data.UserAttributes[i].Name == 'sub')
            {
                UserID = data.UserAttributes[i].Value;
            }
        }

        for(var i = 0; i < data.UserAttributes.length; i++)
        {
            if(data.UserAttributes[i].Name == 'name')
            {
                UserName = data.UserAttributes[i].Value;
            }
        }

        for(var j = 0; j < data.UserAttributes.length; j++)
        {
            if(data.UserAttributes[j].Name == 'email')
            {
                UserEmail = data.UserAttributes[j].Value;
            }
        }

        document.getElementById('UserName').innerHTML = UserName;
        document.getElementById('UserEmail').innerHTML = UserEmail;

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolID,
            Logins: {
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_V1EsMSASg': idToken
            }
        });
        
        AWS.config.credentials.get(function(err) 
        {
            console.log(AWS.config.credentials);
        });  

        var s3 = new AWS.S3({apiVersion: '2006-03-01'});
        var params = {
            Bucket: "proc-pdf-files-bucket", 
            Prefix: UserID,
        };

        const s3Stream = s3.listObjects(params, function(err, data){
            if(err)
            {
                console.log(err)
            }
            else
            {
                var download_img_tr = document.getElementById('download_img_tr')
                document.getElementById("tablebody").removeChild(download_img_tr);

                if(data.Contents.length != 0)
                {
                    for(let row = 0; row < data.Contents.length; row++)
                    {
                        var tr = document.createElement("tr");

                        var td1 = document.createElement("td");
                        var td1_text = document.createTextNode(row + 1);
                        td1.appendChild(td1_text);

                        var td2 = document.createElement("td");
                        var filenm = data.Contents[row].Key.split("/")
                        var td2_text = document.createTextNode(filenm[1]);
                        td2.classList.add('word-wrap', 'file-name');
                        td2.appendChild(td2_text);

                        var td3 = document.createElement("td");
                        var date = data.Contents[row].LastModified.toUTCString()
                        var td3_text = document.createTextNode(date);
                        td3.appendChild(td3_text);

                        var td4 = document.createElement("td");
                        var size = bytesToSize(data.Contents[row].Size)
                        var td4_text = document.createTextNode(size);
                        td4.classList.add('word-wrap');
                        td4.appendChild(td4_text);

                        var td5 = document.createElement("td");
                        var td5_btn = document.createElement("button");
                        var td5_text = document.createTextNode('Download');
                        td5_btn.classList.add('download-btn');
                        td5_btn.setAttribute("onclick", "downloadFile(closest('tr'))");
                        td5_btn.appendChild(td5_text);
                        td5.appendChild(td5_btn);

                        var td6 = document.createElement("td");
                        var td6_btn = document.createElement("button");
                        var td6_text = document.createTextNode('Delete');
                        td6_btn.classList.add('delete-btn');
                        td6_btn.setAttribute("onclick", "deleteFile(closest('tr'))");
                        td6_btn.appendChild(td6_text);
                        td6.appendChild(td6_btn);

                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        tr.appendChild(td3);
                        tr.appendChild(td4);
                        tr.appendChild(td5);
                        tr.appendChild(td6);

                        document.getElementById("tablebody").appendChild(tr);
                    }
                }
                else
                {
                    var nodatatr = document.createElement("tr");

                    var nodatatd = document.createElement("td");
                    var nodatatd_text = document.createTextNode("No record found.");
                    nodatatd.colSpan = "6";
                    nodatatd.appendChild(nodatatd_text);

                    nodatatr.appendChild(nodatatd);
                    document.getElementById("tablebody").appendChild(nodatatr);
                }
                    
            }
        })
    }
});

function bytesToSize(bytes) 
{
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function downloadFile(e)
{
    var s3 = new AWS.S3({apiVersion: '2006-03-01'});
        var params = {
            Bucket: "proc-pdf-files-bucket", 
            Key: UserID + '/' + e.cells[1].firstChild.textContent,
            Expires: 360
        };
    
        var promise = s3.getSignedUrlPromise('getObject', params);
        
        promise.then(function(url) {
            console.log('The URL is', url);
            swal({
                title: "Success",
                text: "Downloadalbe file generated successfully, This generated downloadable file valid for next 2 min.",
                icon: "success",
                button: {
                    text: "Cancel",
                    value: null,
                    visible: true,
                    className: "swal-button",
                    closeModal: true
                },
                content: {
                    element: "a",
                    attributes: {
                        text: "Download",
                        download: e.cells[1].firstChild.textContent,
                        href: url,
                        className: "swal-content__a"
                    },
                }
            })
        }, function(err) {
            console.log(err)
        });
}

function deleteFile(e)
{
    console.log(e.cells[1].firstChild.textContent);
    var s3 = new AWS.S3({apiVersion: '2006-03-01'});
        var params = {
            Bucket: "proc-pdf-files-bucket", 
            Key: UserID + '/' + e.cells[1].firstChild.textContent
        };

    swal({
        title: "Success",
        text: "Please wait, we are deleting your this file.",
        icon: "success",
        closeOnClickOutside: false,
        closeOnEsc: false,
        buttons: false
    });

    s3.deleteObject(params, function(err, data) {
        if (err) 
        {
            swal.close()
            swal({
                title: "Error",
                text: err + err.stack ,
                icon: "error",
                buttons: false
            });
        }
        else     
        {
            location.reload(); 
        }     
    });
}
