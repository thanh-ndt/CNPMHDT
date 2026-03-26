const fs = require('fs');
const path = require('path');

const techMap = {
  "Honda Vision": "eSP, eSAF, PGM-FI",
  "Honda SH Mode 125": "eSP+, CBS, PGM-FI, LED toàn phần",
  "Honda Winner X": "ABS, Smartkey, PGM-FI, Xích phớt",
  "Honda Air Blade 125": "eSP+, PGM-FI, CBS, Cổng sạc USB",
  "Honda Air Blade 160": "eSP+, ABS, Smart Key, PGM-FI",
  "Honda SH 125i": "ABS, Smartkey, Bluetooth LCD, eSP+",
  "Honda SH 160i": "ABS 2 kênh, HSTC, Smartkey, Bluetooth LCD",
  "Honda Wave Alpha": "PGM-FI, ACG Starter",
  "Honda Future 125 FI": "eSP, PGM-FI, ACG Starter",
  "Yamaha Exciter 155 VVA": "VVA, ABS, SSS, D-MODE",
  "Honda Vario 160": "eSP+, ABS, Smartkey, PGM-FI",
  "Honda Lead 125": "eSP+, CBS, Smartkey, PGM-FI",
  "Yamaha Grande": "Blue Core Hybrid, ABS, Smart Battery",
  "Honda SH 350i": "ABS 2 kênh, HSTC, Ride-by-Wire, eSP+",
  "Honda Rebel 500": "ABS 2 kênh, Dual Throttle Body, DOHC",
  "Honda Super Cub C125": "Smartkey, PGM-FI, eSP, ABS",
  "Yamaha Janus": "Blue Core, MIU, Blue Core SEP",
  "Yamaha NVX 155": "VVA, ABS, Traction Control, Y-SST",
  "Yamaha Sirius FI": "Fuel Injection, Blue Core, Tubeless",
  "Suzuki Raider R150": "DOHC 4-van, EFI, Slipper Clutch",
  "Suzuki Satria F150": "DOHC, EFI, Antilock Braking",
  "Vespa Sprint 125": "ABS, i-Get, Eco-Drive",
  "Vespa Primavera 125": "ABS, i-Get, Eco-Drive, ASR",
  "Piaggio Liberty 125": "ABS, i-Get Engine, Smart ECO",
  "Honda CBR150R": "ABS 2 kênh, DOHC 4-van, Slipper Clutch",
  "VinFast Theon S": "Motor điện 7100W, ABS, Kết nối App",
  "VinFast Feliz S": "Motor Brushless, IP67, Sạc tiêu chuẩn",
  "Honda CB150R": "ABS 2 kênh, DOHC, Neo Sports Café",
  "SYM Attila 125": "EFI, CBS, ACG Starter",
  "SYM Star SR 125": "Ecotech EFI, Đĩa đôi, ACG Starter",
  "Honda Blade 110": "PGM-FI, eSP, ACG Starter",
  "Honda Vario 125": "eSP, CBS, Smartkey, PGM-FI"
};

const filePath = path.join(__dirname, 'vehicles_data.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.forEach(vehicle => {
  if (!vehicle.specifications) vehicle.specifications = {};
  vehicle.specifications.cong_nghe = techMap[vehicle.name] || 'EFI, Đĩa trước';
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Đã thêm cong_nghe vào ${data.length} xe trong vehicles_data.json!`);
