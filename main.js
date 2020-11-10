const noble = require('@abandonware/noble');
const bleno = require('@abandonware/bleno');
const { processPowerData } = require('./kinetic');

const inrideService = 'E9410100-B434-446B-B5CC-36592FC4C724';
const inrideMeasurement = 'E9410101-B434-446B-B5CC-36592FC4C724';

console.log("INITIALIZING BLUETOOTH");

noble.on('stateChange', async (state) => {
  if (state === 'poweredOn') {
    console.log("SEARCHING FOR DEVICES");
    await noble.startScanningAsync([inrideService], true);
  }
});

let speed = 0;
let rpm = 0;
let speedLastUpdated = Date.now();
let rpmLastUpdated = Date.now();

function readPowerMeasurement(data) {
  const powerData = processPowerData(data);
  return { watts: powerData.power, cadence: powerData.cadenceRPM };
}

const mphToMetersPerSecond = 2.237;

function wattsToMps(watts) {
  const mph = Math.max(Math.min(2.38413 * Math.pow(watts + 542.047, 0.284216) - 0.406862 * Math.pow(0.997621, watts - 1506.75), 25), 0);
  return mph / mphToMetersPerSecond;
}

let logEmit = false;

function receivePowerMeasurement(data) {
  logEmit = true;
  const { watts, cadence } = readPowerMeasurement(data);
  if (watts != null) {
    speed = wattsToMps(watts);
    speedLastUpdated = Date.now();
  }
  if (cadence != null) {
    rpm = cadence;
    rpmLastUpdated = Date.now();
  }
}

async function getCharacteristic(peripheral, service, characteristic) {
  const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([service], [characteristic]);
  return characteristics[0];
}

async function grabPowerMeasurements(peripheral) {
  await peripheral.connectAsync();
  console.log("READY");
  const measurementCharacteristic = await getCharacteristic(peripheral, inrideService, inrideMeasurement);
  measurementCharacteristic.on('data', receivePowerMeasurement);
  measurementCharacteristic.notify(true);
}

noble.on('discover', (peripheral) => {
  console.log("FOUND TRAINER -- CONNECTING");
  processPeripheral(peripheral);
});

function processPeripheral(peripheral) {
  noble.stopScanningAsync();
  grabPowerMeasurements(peripheral);

}

const CadentialBle = require('./cadentialBle');
const cadentialBle = new CadentialBle();

setInterval(() => {
  const now = Date.now();
  let speedAdjustment = speed;
  if (now - speedLastUpdated > 4000) {
    speedAdjustment *= 0;
  } else if (now - speedLastUpdated > 3000) {
    speedAdjustment *= .25;
  } else if (now - speedLastUpdated > 2000) {
    speedAdjustment *= .5;
  }
  let rpmAdjustment = rpm;
  if (now - rpmLastUpdated > 4000) {
    rpmAdjustment *= 0;
  } else if (now - rpmLastUpdated > 3000) {
    rpmAdjustment *= .25;
  } else if (now - rpmLastUpdated > 2000) {
    rpmAdjustment *= .5;
  }

  const data = {
    speed: speedAdjustment,
    cadence: rpmAdjustment,
  };
  if (logEmit) {
    console.log("EMIT", {
      speed: data.speed * mphToMetersPerSecond,
      cadence: data.cadence
    });
  }

  cadentialBle.notifyRSC(data);
}, 1000)
