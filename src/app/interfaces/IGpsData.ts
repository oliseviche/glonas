export interface IGpsDataRecord {
    latitude: number;
	radius: number;
	longitude: number;
	timestamp:  number;
}
export default interface IGpsData {
    data: IGpsDataRecord[]
}