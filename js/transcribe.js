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
            Bucket: "proc-csv-files-bucket", 
            Key: sessionStorage.getItem('s3FileKey')
        };

        const s3Stream = s3.getObject(params, function(err, data){
            if(err)
            {
                console.log(err)
            }
            else
            {
                console.log(data.Body.toString('utf8'));
                var s3output = data.Body.toString('utf8')
                var removeInvertedCom = s3output.replace(/["]+/g, '')
                var splitByNewLine = removeInvertedCom.split('\n')
                var header = splitByNewLine[0].split(',')

                var time = []
                var spk = []
                var set = []

                for(let i = 1; i < splitByNewLine.length; i++)
                {
                    var splitByComma = splitByNewLine[i].split(',')
                    var comment = '';
                    if(splitByComma.length > 3)
                    {
                        for(let j = 0; j < splitByComma.length; j++)
                        {
                            if(j == 0)
                            {
                                time.push(splitByComma[j])
                            }
                            else if(j == 1)
                            {
                                spk.push(splitByComma[j])
                            }
                            else
                            {
                                comment+= splitByComma[j]
                            }
                        }
                        set.push(comment.trim())
                    }
                    else
                    {
                        for(let j = 0; j < splitByComma.length; j++)
                        {
                            if(j == 0)
                            {
                                time.push(splitByComma[j])
                            }
                            else if(j == 1)
                            {
                                spk.push(splitByComma[j])
                            }
                            else
                            {
                                set.push(splitByComma[j].trim())
                            }
                        }
                    }
                }
                const distinct = (value, index, self) => {
                    return self.indexOf(value) === index
                }
                var distinctSpk = spk.filter(distinct)
                no_of_output = set.length;
                console.log(time)
                console.log(spk)
                console.log(set)
                console.log(distinctSpk)

                var spk_wait_img = document.getElementById('spk_wait_img')
                var spk_wait = document.getElementById('spk_wait')
                document.getElementById("speakers_dynamic").removeChild(spk_wait_img);
                document.getElementById("speakers_dynamic").removeChild(spk_wait);

                for(let disSpk = 0; disSpk < distinctSpk.length; disSpk++)
                {
                    var input = document.createElement("input");
                    input.type = "text";
                    input.classList.add("form-control", "form-control-sm",  "my-1")
                    input.setAttribute("data-tag", distinctSpk[disSpk]);
                    input.setAttribute("oninput", "changeSpkName(this)");
                    input.placeholder = distinctSpk[disSpk];
                    input.value = distinctSpk[disSpk];
                    document.getElementById("speakers_dynamic").appendChild(input)
                }

                var trans_wait_img = document.getElementById('trans_wait_img')
                var trans_wait = document.getElementById('trans_wait')
                document.getElementById('transcribe_output').classList.remove("d-flex", "flex-column", "justify-content-center", "align-content-center")
                document.getElementById("transcribe_output").removeChild(trans_wait_img);
                document.getElementById("transcribe_output").removeChild(trans_wait);

                for(let tra = 0; tra < set.length; tra++)
                {
                    var div = document.createElement("div");
                    div.classList.add("form-group");

                    var label_1 = document.createElement("label");
                    label_1.classList.add(spk[tra]);
                    var label_1_text = document.createTextNode(spk[tra] + " ");
                    label_1.appendChild(label_1_text);

                    var label_2 = document.createElement("label");
                    var label_2_text = document.createTextNode(String.fromCharCode(160) + "|" + String.fromCharCode(160) + time[tra]);
                    label_2.appendChild(label_2_text);

                    var textarea = document.createElement("textarea");
                    textarea.classList.add("form-control", "my-1");
                    textarea.id = "textarea-" + tra;
                    textarea.rows = "2";
                    textarea.value = set[tra];

                    var p = document.createElement("p");
                    p.classList.add("d-none");
                    p.id = 'p-' + tra;

                    div.appendChild(label_1);
                    div.appendChild(label_2);
                    div.appendChild(textarea);
                    div.appendChild(p);

                    document.getElementById("transcribe_output").appendChild(div)
                }
            }
        });
    }
});

function changeSpkName(e){
    console.log(e.value);
    var data_tag = e.getAttribute("data-tag");
    var arr_spk = document.getElementsByClassName(data_tag)

    for(let i = 0; i < arr_spk.length; i++)
    {
        arr_spk[i].innerHTML = e.value;
    }
}

function exportHTML()
{
    for (let i = 0; i < no_of_output; i++)
    {
        document.getElementById('p-' + i).innerHTML = document.getElementById('textarea-' + i).value;
    }
    var doc = new jsPDF();
	var elementHTML = document.getElementById('transcribe_output').innerHTML;
	var specialElementHandlers = {
		'#elementH': function (element, renderer) {
			return true;
		}
	};
	doc.fromHTML(elementHTML, 15, 15, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    });

	console.log(doc.output('blob'))
	
    if(document.getElementById('fileName').value == '')
    {
        var upload = new AWS.S3.ManagedUpload({
            params: {
                Bucket: 'proc-pdf-files-bucket',
                Key: UserID + '/' + sessionStorage.getItem('fileName') + '.pdf',
                Body: doc.output('blob')
            }
        })

        swal({
            title: "Success",
            text: "Please wait, we are uploading your transcription for your future use.",
            icon: "success",
            closeOnClickOutside: false,
            closeOnEsc: false,
            buttons: false
        });

        var promise = upload.promise();

        promise.then(
            function(data) {
                swal.close();
                doc.save(sessionStorage.getItem('fileName') + '.pdf');
            });
    }
    else
    {
        var upload = new AWS.S3.ManagedUpload({
            params: {
                Bucket: 'proc-pdf-files-bucket',
                Key: UserID + '/' + document.getElementById('fileName').value + '-' + sessionStorage.getItem('fileName') + '.pdf',
                Body: doc.output('blob')
            }
        })

        swal({
            title: "Success",
            text: "Please wait, we are uploading your transcription for your future use.",
            icon: "success",
            closeOnClickOutside: false,
            closeOnEsc: false,
            buttons: false
        });

        var promise = upload.promise();

        promise.then(
            function(data) {
                swal.close();
                doc.save(document.getElementById('fileName').value + '-' + sessionStorage.getItem('fileName') + '.pdf');
            });
    }
}