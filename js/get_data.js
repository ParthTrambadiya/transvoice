str = `Time,Speaker,Sentence
0:00:01,spk_0," Hey, Jane. So what brings you into my office today?"
0:00:03,spk_1," Hey, Dr Michaels. Good to see you. I'm just coming in from my routine shake"
0:00:07,spk_0," up. All right, Let's see, I last saw you. About what, Like a year ago. And at that time, I think you were having some minor headaches."
0:00:14,spk_0," I don't recall prescribing anything, and we said we'd maintain some observations unless things were getting worse."
0:00:20,spk_1," That's right. Actually, the headaches have gone away. I think getting more sleep was super helpful. I've also been more careful about my water intake throughout my work day."
0:00:29,spk_0," Yeah, I'm not surprised at all. Sleep deprivation and chronic dehydration or to common contributors to potential headaches. Rest is definitely vital when you become dehydrated. Also, your brain tissue loses water, causing your brain to shrink and kind of pull away from the skull. And this can trigger the pain receptors around the brain, giving you the sensation of the headache."
0:00:48,spk_0, So how much water are you roughly taking in in each day
0:00:52,spk_1," of, um, I've become obsessed with drinking enough water. I have one of those fancy water bottles that have graduated markers on the side."
0:01:00,spk_1," I've also been logging my water intake pretty regularly. On average, I drink about three liters a day."
0:01:06,spk_0, That's excellent. Before I start to routine physical exam is there anything else you'd like me to know? Anything you'd like to share? What else has been bothering you?`

var a = str.replace(/["]+/g, '')
var b = a.split('\n')
var c = b[0].split(',')

var time = []
var spk = []
var set = []

for(let i = 1; i < b.length; i++)
{
	var d = b[i].split(',')
    var comment = '';
    console.log(d)
    if(d.length > 3)
    {
    	for(let j = 0; j < d.length; j++)
        {
        	if(j == 0)
            {
            	time.push(d[j])
            }
            else if(j == 1)
            {
            	spk.push(d[j])
            }
            else
            {
                comment+= d[j] + ' '
            }
        }
        set.push(comment.trim())
    }
    else
    {
    	for(let j = 0; j < d.length; j++)
        {
        	if(j == 0)
            {
            	time.push(d[j])
            }
            else if(j == 1)
            {
            	spk.push(d[j])
            }
            else
            {
            	set.push(d[j].trim())
            }
        }
    }
}

console.log(time)
console.log(spk)
console.log(set)

