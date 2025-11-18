import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRImage = ({ address, size }) => <QRCodeSVG value={address} size={size} />;

export default QRImage;
