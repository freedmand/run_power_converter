// Adapted from Zwack https://github.com/paixaop/zwack

const bleno = require('@abandonware/bleno');
const EventEmitter = require('events');

const RSCService = require('./rscService');

class CadentialBle extends EventEmitter {

  constructor(options = {}) {
    super();

    this.name = options.name || "Cadential";
    process.env['BLENO_DEVICE_NAME'] = this.name;

    this.rsc = new RSCService();

    this.last_timestamp = 0;
    this.rev_count = 0;

    let self = this;

    bleno.on('stateChange', (state) => {
      self.emit('stateChange', state);
      if (state === 'poweredOn') {
        bleno.startAdvertising(self.name, [
          self.rsc.uuid
        ]);
      } else {
        bleno.stopAdvertising();
      }
    });

    bleno.on('advertisingStart', (error) => {
      self.emit('advertisingStart', error);

      if (!error) {
        bleno.setServices([
          self.rsc
        ],
          (error) => {
            if (error) {
              console.log(`[${this.name} setServices] ${(error ? 'error ' + error : 'success')}`);
            }
          });
      }
    });

    bleno.on('advertisingStartError', () => {
      self.emit('advertisingStartError');
    });

    bleno.on('advertisingStop', error => {
      self.emit('advertisingStop');
    });

    bleno.on('accept', (clientAddress) => {
      self.emit('accept', clientAddress);
      bleno.updateRssi();
    });

    bleno.on('rssiUpdate', (rssi) => {
    });
  }

  notifyRSC(event) {
    this.rsc.notify(event);

    if (!(('speed' in event) && ('cadence' in event))) {
      console.log("[" + this.name + " notifyCSP] unrecognized event: %j", event);
    }
  };
};

module.exports = CadentialBle;
