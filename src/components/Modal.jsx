// src/components/Modal.jsx
import React from "react";

export default function Modal({ title, body, onClose, width = 50 }) {

  return (
    <div className="bubble-modal" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: `${width}%` }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{margin: 0}}>{title ?? ''}</h2>
        <div className="modal-body">{body}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

