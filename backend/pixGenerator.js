// Gerador de Pix Copia e Cola (Payload EMV)
export function generatePixPayload(pixKey, value, merchantName, merchantCity) {
  const truncate = (str, max) => str.substring(0, max);
  
  // Funções auxiliares para gerar o payload EMV
  const generateEMV = (id, value) => {
    const size = String(value.length).padStart(2, '0');
    return `${id}${size}${value}`;
  };

  // IDs EMV do Pix
  const ID_PAYLOAD_FORMAT_INDICATOR = '00';
  const ID_MERCHANT_ACCOUNT_INFORMATION = '26';
  const ID_MERCHANT_ACCOUNT_INFORMATION_GUI = '00';
  const ID_MERCHANT_ACCOUNT_INFORMATION_KEY = '01';
  const ID_MERCHANT_CATEGORY_CODE = '52';
  const ID_TRANSACTION_CURRENCY = '53';
  const ID_TRANSACTION_AMOUNT = '54';
  const ID_COUNTRY_CODE = '58';
  const ID_MERCHANT_NAME = '59';
  const ID_MERCHANT_CITY = '60';
  const ID_CRC16 = '63';

  // Informações da conta (chave Pix)
  const merchantAccountInformation = 
    generateEMV(ID_MERCHANT_ACCOUNT_INFORMATION_GUI, 'br.gov.bcb.pix') +
    generateEMV(ID_MERCHANT_ACCOUNT_INFORMATION_KEY, truncate(pixKey, 77));

  // Montar payload sem CRC
  let payload = '';
  payload += generateEMV(ID_PAYLOAD_FORMAT_INDICATOR, '01');
  payload += generateEMV(ID_MERCHANT_ACCOUNT_INFORMATION, merchantAccountInformation);
  payload += generateEMV(ID_MERCHANT_CATEGORY_CODE, '0000');
  payload += generateEMV(ID_TRANSACTION_CURRENCY, '986'); // BRL
  payload += generateEMV(ID_TRANSACTION_AMOUNT, value.toFixed(2));
  payload += generateEMV(ID_COUNTRY_CODE, 'BR');
  payload += generateEMV(ID_MERCHANT_NAME, truncate(merchantName, 25));
  payload += generateEMV(ID_MERCHANT_CITY, truncate(merchantCity, 15));
  payload += ID_CRC16 + '04';

  // Calcular CRC16
  const crc16 = calculateCRC16(payload);
  payload += crc16;

  return payload;
}

// Algoritmo CRC16-CCITT para validação Pix
function calculateCRC16(payload) {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ polynomial : crc << 1;
    }
  }

  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
