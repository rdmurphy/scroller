export default function Scroller(n,t){var e=new Map,o=t.offset,r=0;function i(n,t){var o=e.get(n);o&&o.forEach((function(n){n(t)}))}return null==o&&(o=.5),{on:function(n,t){var o=e.get(n);if(!(o&&o.add(t))){const o=new Set;o.add(t),e.set(n,o)}return function(){(o=e.get(n))&&o.delete(t)}},init:function(){var t,e,u,c;for(u=new IntersectionObserver((function(o){for(t=window.pageYOffset,e=t>r,r=t,t=0;t<o.length;t++)u=o[t],c=u.target,i(u.isIntersecting?"enter":"exit",{bounds:u.boundingClientRect,index:o.indexOf.call(n,c),isScrollingDown:e,element:c})}),{rootMargin:-100*(1-o)+"% 0px "+-100*o+"%"}),t=0;t<n.length;t++)u.observe(n[t]);i("init")}}}