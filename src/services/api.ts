/** Future Laravel REST API boundary. No requests or authentication are implemented. */
export type ApiConfiguration = {
  baseUrl: string;
};

// Configure this when backend integration begins. UI currently uses local mock data.
export const apiConfiguration: ApiConfiguration = {
  baseUrl: '',
};
