import { QRCodeSVG } from "qrcode.react";

export default function QRTest() {
  return (
    <div>
      <QRCodeSVG value="https://www.google.com" />
    </div>
  );
}
