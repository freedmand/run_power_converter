const noble = require('@abandonware/noble');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// const cpsService = '1818';
const cpsService = '1814';

// Characteristics
const cpsMeasurement = '2a53';
const cpsFeature = '2a63';

noble.on('stateChange', async (state) => {
  if (state === 'poweredOn') {
    await noble.startScanningAsync([cpsService], true);
  }
});

console.log("SEARCHING FOR DEVICES");

const peripherals = [];
const peripheralMap = {};

noble.on('discover', (peripheral) => {
  if (!peripheral.connectable) return;
  if (peripheral.advertisement == null) return;
  if (peripheral.advertisement.localName == null) return;
  if (peripheral.advertisement.localName.trim().length == 0) return;
  if (peripheralMap[peripheral.id] != null) return;
  peripheralMap[peripheral.id] = peripheral;

  peripherals.push(peripheral);
  if (peripherals.length == 1) {
    // Start answer selection
    console.log('\n\nSelect a bluetooth cycling power sensor\n\n');
    questionInterface();
  }
  console.log(`${peripherals.length}. ${peripheral.advertisement.localName}`);
});

function readPowerMeasurement(data) {
  let cursor = 0
  function readNext(byteLength) {
    const value = (byteLength > 0) ? data.readUIntLE(cursor, byteLength) : undefined
    cursor += byteLength
    return value;
  }

  readNext(2);  // Disregard flags
  const watts = readNext(2);
  return watts;
}

function readSpeedMeasurement(data) {
  let cursor = 0
  function readNext(byteLength) {
    const value = (byteLength > 0) ? data.readUIntLE(cursor, byteLength) : undefined
    cursor += byteLength
    return value;
  }

  readNext(1); // skip flags
  const speed = readNext(2);
  return speed / 256 * 2.23694;
}

function receivePowerMeasurement(data) {
  const watts = readPowerMeasurement(data);
  console.log({ watts });
}

async function getCharacteristic(peripheral, service, characteristic) {
  const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([service], [characteristic]);
  return characteristics[0];
}

async function grabMeasurements(peripheral) {
  console.log("Connecting...");
  await peripheral.connectAsync();
  const measurementCharacteristic = await getCharacteristic(peripheral, cpsService, cpsMeasurement);
  console.log("CONNECTED");
  measurementCharacteristic.on('data', receivePowerMeasurement);
  measurementCharacteristic.notify(true);
}

function questionInterface() {
  rl.question('', (answer) => {
    const index = parseInt(answer);
    if (index == null || !isFinite(index) || index < 1 || index > peripherals.length) {
      console.log('Bad input; try again\n')
      questionInterface();
      return;
    }

    rl.close();
    noble.stopScanningAsync();
    grabMeasurements(peripherals[index - 1]);
  });
}
