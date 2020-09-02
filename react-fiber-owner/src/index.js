import React from "./react";
import ReactDOM from "./react-dom";
//虚拟DOM就是一个JS对象，以js对象的方式描述界面上的DOM
var element = (
  <div id="A1">
    <div id="B1">
      <div id="C1"></div>
      <div id="C2"></div>
    </div>
    <div id="B2"></div>
  </div>
);
console.log(element);
ReactDOM.render(
  element,
  document.getElementById('root')
);
