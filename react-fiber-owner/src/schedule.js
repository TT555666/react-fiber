// 从根节点开始渲染和调度  两个阶段  diff阶段 对比新旧的虚拟DOM，进行增量 更新或创建，render阶段
// 这个阶段比较花时间，可以我们对任务进行拆分，拆分对维度虚拟DOM。此阶段可以暂停
// render阶段成果是effect list 知道哪些节点更新哪些节点删除了，哪些节点增加了
//  render阶段有两个任务1.根据虚拟DOM生成fiber树，2.收集effectlist

import {
  TAG_ROOT,
  ELEMENT_TEXT,
  TAG_TEXT,
  TAG_HOST,
  PLACEMENT,
} from "./constants";
import { setProps } from "./utils";

// commit阶段，进行DOM更新创建阶段，此阶段不能暂停，要一气呵成
let nextUnitOfWork = null; // 下一个工作单元
let workInProgressRoot = null; // RootFiber 应用都根
export function scheduleRoot(rootFiber) {
  // {tag:TAG_ROOT,stateNode:container,props:{children:[element]}}
  nextUnitOfWork = rootFiber;
  workInProgressRoot = rootFiber;
}
function performUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while (currentFiber) {
    completeUnitOfWork(currentFiber); //没有儿子让自己完成
    if (currentFiber.sibling) {
      // 看有没有弟弟，有返回
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.return; //找父亲然后让父亲完成
  }
}
// beginWork 开始收下线都钱
// completeUnitOfWork 把下线都钱收完了
// 1.创建真实DOM元素
// 2.创建子fiber
function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber);
  }
}
function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  } else if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type);
    updateDOM(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}
function updateDOM(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps);
}
function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    //如果此fiber没有创建DOM节点
    currentFiber.stateNode = createDOM(currentFiber);
  }
}

function updateHostRoot(currentFiber) {
  // 先处理自己，如果是一个原生节点，创建真实DOM 2.创建子fiber
  let newChildren = currentFiber.props.children; //[eleemnt=A1]
  reconcileChildren(currentFiber, newChildren);
}
function reconcileChildren(currentFiber, newChildren) {
  //【A1]
  let newChildIndex = 0; // 新子节点都索引
  let prevSibling; // 上一个新都子fiber
  //   遍历我们都子虚拟dom元素组件，为每个虚拟dom元素创建子fiber
  while (newChildIndex < newChildren.length) {
    let newChild = newChild[newChildIndex]; //取出虚拟dom节点
    let tag;
    if (newChild.type == ELEMENT_TEXT) {
      tag = TAG_TEXT; //这是一个文本节点
    } else if (typeof newChild.type === "string") {
      tag = TAG_HOST; //如果type是字符串，那么这是一个原生dom节点 'A1' div
    } // beginWork创建fiber 在completeUnitOfWork的时候收集
    let newFiber = {
      tag, //TAG_HOST
      type: newChild.type,
      props: newChild.props,
      stateNode: null, //div还没有创建dom元素
      return: currentFiber, //父Fiber returnFiber
      effectTag: PLACEMENT, //副作用标识 render我们要会收集副作用 增加 删除 更新

      nextEffect: null, // effect list 也是一个单链表
      // effect list顺序和完成顺序是一样都，但是节点只放那些出钱都人都fiber节点，不出钱绕过去
    };
    if (newFiber) {
      if (newChildIndex === 0) {
        //如果当前索引为0，说明这是太子
        currentFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber; //让太子的sibling弟弟指向二皇子
      }
      prevSibling = newFiber;
    }
    newChildIndex++;
  }
}

// 循环执行工作 nextUnitWork
function workLoop(deadline) {
  let shouldYield = false; // 是否要让出时间片或者说控制权
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork); // 执行完一个任务后
    shouldYield = deadline.timeRemaining() < 1; // 没有时间的话就要让出控制权
  }
  if (!nextUnitOfWork) {
    //如果时间片到期后还有任务没有完成，就需要请求浏览器再次调度
    console.log("renderjieshu");
  }
  // 不管有没有任务，都请求再次调度 每一帧都要执行一次workLoop
  requestIdleCallback(workLoop, { timeout: 500 });
}

//react告诉 浏览器，我现在有任务请你在闲的时候处理
// 有一个优先级的概念。expirationTime
requestIdleCallback(workLoop, { timeout: 500 });
