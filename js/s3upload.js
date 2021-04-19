const url = window.location.href
const replacedURL = url.replace('#', '&')
const finalURL = new URLSearchParams(replacedURL)
var accessToken = finalURL.get('access_token')
var idToken = finalURL.get("id_token")
var expiresIn = finalURL.get('expires_in')
var tokenType = finalURL.get('token_type')
var UserName, UserEmail;

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
        
        sessionStorage.setItem('aws', AWS.config.credentials);
        
        AWS.config.credentials.get(function(err) 
        {
            console.log(AWS.config.credentials);
        });        
    }
});

function s3_upload() 
{   
    if(document.getElementById('fileUpload').value == '')
    {
        swal({
            title: "Error",
            text: "Please select file or provide .wav file.",
            icon: "error",
        });
        return false;
    }
    else
    {
        var d = new Date();
        document.getElementById("uploadBtn").disabled = true;
        document.getElementById("uploadBtn").style.cursor = 'not-allowed';
        var files = document.getElementById('fileUpload').files;   
        if (files) 
        {
            var file = files[0];  
            var fileName = file.name;
            var filename = fileName.split('.').slice(0, -1).join('.') + '-' + d.getTime().toString() + '.' + fileName.split('.').slice(1, 2).join('.');
            sessionStorage.setItem('fileName', fileName.split('.').slice(0, -1).join('.') + '-' + d.getTime().toString())

            var upload = new AWS.S3.ManagedUpload({
                params: {
                Bucket: 'audiorawbucket',
                Key: filename,
                Body: file
                }
            }).on('httpUploadProgress', function(progress){
                var uploaded = parseInt((progress.loaded*100)/progress.total);
                document.getElementById('uploadbar').setAttribute('value', uploaded);
            });

            var promise = upload.promise();

            promise.then(
                function(data) {
                    swal({
                        title: "Success",
                        text: "Audio file uploaded successfully, please wait for few minutes we are generating transcribe.",
                        icon: "success",
                        closeOnClickOutside: false,
                        closeOnEsc: false,
                        buttons: false
                    });
                    var s3 = new AWS.S3({apiVersion: '2006-03-01'});
                    var params = {
                        Bucket: "proc-csv-files-bucket", 
                        Key: "TransVoice-" + sessionStorage.getItem('fileName') + '.csv'
                    };
                    var myVar = setInterval(callS3, 60000);
                    function callS3()
                    {
                        s3.headObject(params, function(err, data) {
                            if(data != null)
                            {
                                console.log(data); 
                                sessionStorage.setItem('s3FileKey', "TransVoice-" + sessionStorage.getItem('fileName') + '.csv');
                                console.log(sessionStorage.getItem('s3FileKey'));
                                clearInterval(myVar)
                                window.location.href = "transcribe.html#access_token=" + sessionStorage.getItem('accessToken') + 
                                                        "&id_token=" + sessionStorage.getItem('idToken') +
                                                        "&expires_in=" + sessionStorage.getItem('expiresIn') +
                                                        "&token_type=" + sessionStorage.getItem('tokenType');
                            }      
                    });
                    }
                },
                function(err) {
                    return swal({
                        title: "Error",
                        text: "There was an error uploading your photo: " + err.message,
                        icon: "error",
                    });
                }
            );
        }
    }
}