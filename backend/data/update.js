const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'vehicles_data.json');
let data = [];
try {
  data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
} catch (e) {
  console.error("Lỗi đọc JSON:", e);
  process.exit(1);
}

data.forEach(bike => {
  // Convert standard Vietnamese string to snake_case filename
  let baseName = bike.name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, '_') // replace spaces and special chars with underscores
    .replace(/(^_|_$)/g, ''); // trim outer underscores
    
  bike.images = [`/images/${baseName}.png`];
});

fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Đã cập nhật xong đường dẫn images trong vehicles_data.json!');
