(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{126:function(e,o,n){"use strict";Object.defineProperty(o,"__esModule",{value:!0}),o.default=function(e){const o=new l.default(e);return{Expression:o.Expression,FlowTypes:o.FlowTypes,NodeTypes:o.NodeTypes,PathTypes:o.PathTypes,FlowDefinition:(e,n,t,l,i,s,r,a,c,d)=>o.FlowDefinition(n,l,s,a,d),NodeDefinition:(e,n,t,l,i)=>o.NodeDefinition(n,t,i),Actions:e=>o.Actions(e),Path:(e,n,t)=>o.Path(e,n,t),NonemptyListOf:(e,n,t)=>o.NonemptyListOf(e,n,t),EmptyListOf:()=>[],Import:(e,n,t,l,i,s)=>o.Import(t,i),Nodes:e=>o.Nodes(e),Milestone:(e,n)=>o.Milestone(e),Node:e=>o.Node(e),WaitsFor:(e,n,t)=>o.WaitsFor(e,t),NodeBase:e=>o.NodeBase(e),SilentNode:(e,n)=>o.SilentNode(e),IdentityNode:(e,n,t)=>o.IdentityNode(e,t),StandardNode:e=>o.StandardNode(e),Channel:e=>o.Channel(e),ErrorChannel:(e,n,t,l)=>o.ErrorChannel(n,t),PlainChannel:(e,n,t)=>o.PlainChannel(n),NamedChannel:(e,n,t,l)=>o.NamedChannel(n,t),Properties:(e,n,t)=>o.Properties(n),Property:(e,n,t)=>o.Property(e,t),HttpMethods:e=>o.HttpMethods(e),label:e=>o.label(e),string:(e,n,t)=>o.string(n),_terminal:()=>this.primitiveValue,alnum:e=>e.sourceString,digit:e=>e.sourceString,number:e=>o.number(e),fraction:(e,n,t)=>o.fraction(e,n,t),whole:e=>o.whole(e),space:e=>o.space(e),comment:e=>o.comment(e),multiLineComment:(e,n,t)=>o.multiLineComment(n),singleLineComment:(e,n)=>o.singleLineComment(e,n)}};var t,l=(t=n(128))&&t.__esModule?t:{default:t}},128:function(e,o,n){"use strict";Object.defineProperty(o,"__esModule",{value:!0}),o.default=void 0;var t=a(n(33)),l=a(n(36)),i=a(n(34)),s=a(n(35)),r=a(n(12));function a(e){return e&&e.__esModule?e:{default:e}}o.default=class{constructor(e){this.application=e,this.nodeFactories={},this.nodeAliases={}}FlowTypes(e){return console.log("FlowTypes"),e.eval()}NodeTypes(e){return console.log("NodeTypes"),e.eval()}PathTypes(e){return console.log("PathTypes"),e.eval()}Expression(e){return console.log("Expression"),e.eval()}FlowDefinition(e,o,n,t,l){console.log("FlowDefinition");const i=o.eval(),s=n.eval();if(this.application.getFlowByHttp(i,s))throw new Error(`Flow definition already exists for the ${i} ${s} endpoint.`);const a=new r.default(this.application,void 0,e.eval(),t.eval(),void 0,i,s,void 0),c=l.eval();a.connect(c),this.application.registerFlow(a)}NodeDefinition(e,o,n){console.log("NodeDefinition");const t=e.eval();if(this.nodeAliases[t])return this.nodeAliases[t];if(void 0!==this.nodeFactories[t])throw new Error(`Node definition already exists for the ${t}.`);this.nodeFactories[t]=((e,o,n,t)=>new i.default(this.application,void 0,e,void 0,o,t));const l=o.eval();return this.nodeFactories[t](t,[],l,n.eval())}Actions(e){console.log("Actions");const o=e.eval(),n=[];return o.forEach(e=>{if(void 0!==e){const o=this.application.requireAction(e,function(){});n.push(o)}}),n}Path(e,o,n){console.log("Path");const t=e.eval(),l=n.eval(),i=o.eval();let s=i;return l.forEach(e=>{void 0!==e&&(s.connect(e),s=e)}),t.connect(i),t}NonemptyListOf(e,o,n){return console.log("NonemptyListOf"),o.eval()instanceof t.default?[e.eval(),o.eval()].concat(n.eval()):[e.eval()].concat(n.eval())}Import(e,o){return console.log("Import"),{}}Nodes(e){return console.log("Nodes"),e.eval()}LinguisticNodes(e){return console.log("LinguisticNodes"),e.eval()}Milestone(e){return console.log("Milestone"),new s.default(this.application,void 0,`Commit ${e}`,"fcfs",[],[])}LinguisticMilestone(e){return console.log("LinguisticMilestone"),new s.default(this.application,void 0,`Commit ${e}`,"fcfs",[],[])}Node(e){return console.log("Node"),e.eval()}WaitsFor(e,o){console.log("WaitsFor")}NodeBase(e){return console.log("NodeBase"),e.eval()}SilentNode(e){console.log("SilentNode");const o=e.eval();if(this.nodeAliases[o.name])throw new Error("Cannot modify labeled a Path root.");return o}IdentityNode(e,o){console.log("IdentityNode");const n=e.eval(),t=o.eval();if(this.nodeAliases[t])throw new Error(`The ${t} alias already exists.`);return this.nodeAliases[t]=n,n}StandardNode(e){const o=e.eval();return this.nodeAliases[o]?this.nodeAliases[o]:this.nodeFactories[o](o,void 0,void 0,void 0)}Concept(e){console.log("Concept");const o=[];return e.forEach(e=>{void 0!==e&&o.push(e.eval())}),o.join(" ")}Channel(e){return console.log("Channel"),e.eval()}ErrorChannel(e,o){console.log("ErrorChannel");const n=e.eval(),t=o.eval();return new l.default(this.application,void 0,n,void 0,[n],t.retry,[])}PlainChannel(e){console.log("PlainChannel");const o=e.eval();return new t.default(this.application,void 0,"Plain",void 0,[],o.retry,[])}NamedChannel(e,o){console.log("NamedChannel");const n=e.eval(),l=o.eval();return new t.default(this.application,void 0,n,void 0,[n],l.retry,[])}Properties(e){console.log("Properties");const o={};return e.eval().forEach(e=>{void 0!==e&&(o[e[0]]=e[1])}),o}Property(e,o){return console.log("Property"),[e.eval(),o.eval()]}HttpMethods(e){return console.log("HttpMethods"),e.eval()}label(e){return console.log("label"),e.eval().join("")}string(e){return console.log("string"),e.eval()}number(e){return console.log("number"),e.eval()}fraction(e,o,n){console.log("fraction");const t=e.eval(),l="0."+n.eval();return Number(t)+Number(l)}whole(e){return console.log("whole"),Number(e.eval())}space(e){return console.log("space"),e.eval()}comment(e){return console.log("comment"),e.eval()}multiLineComment(e){return console.log("multiLineComment"),e.eval()}singleLineComment(e,o){return console.log("singleLineComment"),o.eval()}}}}]);