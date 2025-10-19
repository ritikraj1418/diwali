document.getElementById('createBtn').addEventListener('click',()=>{
  const name=document.getElementById('yourName').value.trim();
  const rec=document.getElementById('recipientName').value.trim();
  if(!name){alert('Enter your name!');return;}
  const chain=[name,rec].filter(Boolean);
  const encoded=btoa(JSON.stringify(chain));
  const url=location.origin+location.pathname+'?chain='+encoded;
  navigator.clipboard.writeText(url).then(()=>alert('Link copied! Share to continue the chain.'));
});