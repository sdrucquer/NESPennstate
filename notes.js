const copyButton=document.getElementById('copy-article-link');
const shareStatus=document.getElementById('share-status');
if(copyButton&&shareStatus){copyButton.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(location.href);shareStatus.textContent='Link copied';}
  catch{shareStatus.textContent='Copy the page URL from your browser';}
});}
