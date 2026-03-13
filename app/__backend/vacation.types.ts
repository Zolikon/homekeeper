// app/__backend/vacation.types.ts

export type VacationInfo = {
  id: string;
  city: string;
  hotelName: string;
  hotelAddress?: string;
  hotelCheckIn?: string;   // "YYYY-MM-DD"
  hotelCheckOut?: string;  // "YYYY-MM-DD"
  hotelNotes?: string;
  weatherLat?: number;     // cached geocoded coordinates
  weatherLon?: number;
};

export type VacationFlight = {
  id: string;  // "outbound" | "return"
  flightNumber?: string;
  airline?: string;
  departureTime: string;      // "YYYY-MM-DD HH:mm"
  departureTerminal?: string; // optional — budget airlines assign terminals late
  arrivalTime: string;        // "YYYY-MM-DD HH:mm"
  arrivalTerminal?: string;   // optional
  baggageInfo?: string;
};

export type VacationDay = {
  id: string;
  date: string;   // "YYYY-MM-DD"
  order: number;
};

export type VacationProgram = {
  id: string;
  dayId: string;
  name: string;
  startTime: string;  // "HH:mm" — programs sorted by this field; no separate order needed
  endTime?: string;   // "HH:mm"
  address?: string;
  notes?: string;
};

export type WeatherData = {
  temperatureCelsius: number;
  weatherCode: number;       // WMO weather code
  weatherDescription: string;
  windSpeedKmh: number;
};

// Singleton IDs
export const VACATION_INFO_ID = "main";
export const VACATION_FLIGHT_OUT_ID = "outbound";
export const VACATION_FLIGHT_BACK_ID = "return";
