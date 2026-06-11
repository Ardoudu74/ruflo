export type StoryStatus = 'active' | 'reported' | 'removed';

export interface Story {
  id: string;
  venueId: string;
  venueName: string;
  city: string;
  uid: string;
  displayName: string;
  videoUri: string;
  thumbnailUri?: string;
  caption: string;
  createdAt: number;
  expiresAt: number;
  lat: number;
  lng: number;
  geoVerified: boolean;
  status: StoryStatus;
  reportCount: number;
  views: number;
}
