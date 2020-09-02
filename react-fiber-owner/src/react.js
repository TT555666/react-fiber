import { ELEMENT_TEXT } from "./constants";
function createElement(type, config, ...children) {
  delete config.__self;
  delete config.__source;
  return {
    type,
    props: {
      ...config, // 做了一个兼容处理，如果是React元素的话返回自己，如果是文本类型，如果是一个字符串的话，返回元素对象
      children: children.map((child) => {
        //   如果这个child是一个React.createElement返回的React元素，如果是字符串的话，才转为文本节点
        return typeof child === "object"
          ? child
          : {
              type: ELEMENT_TEXT,

              props: { text: child, children: [] },
            };
      }),
    },
  };
}
const React = {
  createElement,
};
export default React;
