'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getPlatform,
  isOnline as checkIsOnline,
  onOnlineStatusChange,
  watchOrientation,
  requestNotificationPermission,
  requestCamera,
  stopCamera,
  requestMicrophone,
  stopMicrophone,
  getCurrentLocation,
  watchLocation,
  showNotification,
  copyToClipboard,
  readFromClipboard,
  shareContent,
  vibrate,
  requestWakeLock,
  getBatteryStatus,
  getStorageEstimate,
  requestFullscreen,
  exitFullscreen,
  hasBiometricSupport,
  MediaRecorder2,
  type Platform,
  type PermissionStatus,
  type CameraOptions,
  type NotificationOptions,
  type ShareData,
  type LocationCoords,
  type BatteryStatus,
  type StorageEstimate,
  type WakeLockHandle,
} from '@/lib/device-access';

export interface DeviceAccessState {
  platform: Platform;
  online: boolean;
  orientation: 'portrait' | 'landscape';
  notificationPermission: PermissionStatus;
}

export interface DeviceAccessActions {
  requestCamera: (options?: CameraOptions) => Promise<MediaStream | null>;
  stopCamera: (stream: MediaStream) => Promise<void>;
  requestMicrophone: () => Promise<MediaStream | null>;
  stopMicrophone: (stream: MediaStream) => Promise<void>;
  getCurrentLocation: () => Promise<LocationCoords | null>;
  watchLocation: (callback: (pos: { lat: number; lng: number }) => void) => () => void;
  requestNotificationPermission: () => Promise<PermissionStatus>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  copyToClipboard: (text: string) => Promise<boolean>;
  readFromClipboard: () => Promise<string | null>;
  shareContent: (data: ShareData) => Promise<boolean>;
  vibrate: (pattern?: number | number[]) => boolean;
  requestWakeLock: () => Promise<WakeLockHandle | null>;
  getBatteryStatus: () => Promise<BatteryStatus | null>;
  getStorageEstimate: () => Promise<StorageEstimate | null>;
  requestFullscreen: (element?: HTMLElement) => Promise<boolean>;
  exitFullscreen: () => Promise<void>;
  hasBiometricSupport: () => Promise<boolean>;
  createMediaRecorder: (stream: MediaStream, options?: { mimeType?: string }) => MediaRecorder2;
}

export type UseDeviceAccessReturn = DeviceAccessState & DeviceAccessActions;

export function useDeviceAccess(): UseDeviceAccessReturn {
  const platform = useMemo(() => getPlatform(), []);
  const [online, setOnline] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [notificationPermission, setNotificationPermission] = useState<PermissionStatus>('prompt');

  useEffect(() => {
    setOnline(checkIsOnline());
    return onOnlineStatusChange(setOnline);
  }, []);

  useEffect(() => {
    return watchOrientation(setOrientation);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unavailable');
      return;
    }
    const perm = Notification.permission;
    setNotificationPermission(
      perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'prompt',
    );
  }, []);

  const handleRequestNotificationPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setNotificationPermission(status);
    return status;
  }, []);

  const createMediaRecorder = useCallback(
    (stream: MediaStream, options?: { mimeType?: string }) => new MediaRecorder2(stream, options),
    [],
  );

  const actions: DeviceAccessActions = useMemo(
    () => ({
      requestCamera,
      stopCamera,
      requestMicrophone,
      stopMicrophone,
      getCurrentLocation,
      watchLocation,
      requestNotificationPermission: handleRequestNotificationPermission,
      showNotification,
      copyToClipboard,
      readFromClipboard,
      shareContent,
      vibrate,
      requestWakeLock,
      getBatteryStatus,
      getStorageEstimate,
      requestFullscreen,
      exitFullscreen,
      hasBiometricSupport,
      createMediaRecorder,
    }),
    [handleRequestNotificationPermission, createMediaRecorder],
  );

  return {
    platform,
    online,
    orientation,
    notificationPermission,
    ...actions,
  };
}
