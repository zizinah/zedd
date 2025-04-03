import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // 스타일 파일을 사용하려면 추가
import App from './App';  // App.js 파일을 불러옵니다

// React 애플리케이션을 'root' DOM 요소에 렌더링합니다.
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
