export interface IFingerprintData {
  visitorId: string;
  components: {
    dateTimeLocale: string | -1 | -2 | -3 | undefined;
    platform: string | undefined;
    screenResolution: [number, number] | undefined;
    timezone: string | undefined;
  };
}
