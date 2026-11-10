(()=>{const bar=document.getElementById('story-progress');if(!bar)return;
let t=false;const u=()=>{const h=document.documentElement;const max=h.scrollHeight-h.clientHeight;bar.style.width=(max>0?(h.scrollTop/max)*100:0)+'%';t=false;};
addEventListener('scroll',()=>{if(!t){t=true;requestAnimationFrame(u);}},{passive:true});u();})();
