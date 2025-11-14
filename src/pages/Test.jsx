import React, { useState, useRef, useEffect } from "react";

const Test = () => {
  const [port, setPort] = useState(null);
  const [log, setLog] = useState("");
  const inputRef = useRef();
  const [autoSending, setAutoSending] = useState(false);

  // 로그에 메시지 추가
  const appendLog = (msg) => {
    setLog((prev) => prev + msg + "\n");
  };

  // USB 연결
  const handleConnect = async () => {
    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      setPort(selectedPort);
      appendLog("✓ USB 연결 성공!");
      readLoop(selectedPort);
    } catch (err) {
      appendLog("❌ 연결 실패: " + err);
    }
  };

  // USB 읽기 루프
  const readLoop = async (selectedPort) => {
    const textDecoder = new TextDecoder();
    const reader = selectedPort.readable.getReader();

    while (true) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          appendLog("포트 연결 종료됨.");
          reader.releaseLock();
          break;
        }
        if (value) {
          appendLog("ESP → " + textDecoder.decode(value));
        }
      } catch (err) {
        appendLog("읽기 오류: " + err);
        break;
      }
    }
  };

  // 수동 데이터 전송
  const handleSend = async () => {
    if (!port) {
      appendLog("⚠ 먼저 USB 연결 버튼을 눌러주세요.");
      return;
    }

    const msg = inputRef.current.value + "\n";
    const encoder = new TextEncoder();

    try {
      const writer = port.writable.getWriter();
      await writer.write(encoder.encode(msg));
      writer.releaseLock();
      appendLog("PC → " + msg);
    } catch (err) {
      appendLog("전송 실패: " + err);
    }
  };

  // 자동 반복 전송
  useEffect(() => {
    if (!port || !autoSending) return;

    const interval = setInterval(async () => {
      const msg = "hello\n"; // 자동 전송 메시지
      try {
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode(msg));
        writer.releaseLock();
        appendLog("PC → " + msg);
      } catch (err) {
        appendLog("자동 전송 실패: " + err);
      }
    }, 1000); // 1초마다 전송

    return () => clearInterval(interval); // cleanup
  }, [port, autoSending]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>USB Test (ESP32-S3)</h2>

      <button onClick={handleConnect}>USB Connect</button>

      <div style={{ marginTop: "20px" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="전송할 메시지 입력"
          style={{ padding: "5px", width: "300px" }}
        />
        <button onClick={handleSend} style={{ marginLeft: "10px" }}>
          Send
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>
          <input
            type="checkbox"
            checked={autoSending}
            onChange={(e) => setAutoSending(e.target.checked)}
          />{" "}
          자동 반복 전송 (1초)
        </label>
      </div>

      <pre
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#eee",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {log}
      </pre>
    </div>
  );
};

export default Test;