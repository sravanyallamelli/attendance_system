import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { User, AttendanceRecord, LeaveRequest, Holiday, Payslip } from '../types';
import { api } from '../services/api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export const useAttendance = (currentUser: User | null, showToast: (m: string, t?: 'success' | 'error') => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [staffTab, setStaffTab] = useState<'attendance' | 'leaves' | 'holidays' | 'payslips'>('attendance');
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [yesterdayRecords, setYesterdayRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [newLeave, setNewLeave] = useState({ 
    type: 'Sick Leave' as LeaveRequest['type'], 
    start_date: '', 
    end_date: '', 
    reason: '', 
    attachment: '' 
  });

  const fetchAttendanceRecords = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [today, yesterday] = await Promise.all([
        api.getAttendance(currentUser.id, 'today'),
        api.getAttendance(currentUser.id, 'yesterday')
      ]);
      setTodayRecords(today);
      setYesterdayRecords(yesterday);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  const fetchLeaves = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getLeaves(currentUser.id);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  const fetchHolidays = useCallback(async () => {
    try {
      const data = await api.getHolidays();
      setHolidays(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPayslips = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.getPayslips(currentUser.id);
      setPayslips(data);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'staff') {
      fetchAttendanceRecords();
      fetchLeaves();
      fetchHolidays();
      fetchPayslips();
      loadModels();
    }
  }, [currentUser, fetchAttendanceRecords, fetchLeaves, fetchHolidays, fetchPayslips]);

  const loadModels = async () => {
    try {
      console.log('Loading face detection models from:', MODEL_URL);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      ]);
      console.log('Face detection models loaded successfully');
      setIsModelLoaded(true);
      startVideo();
    } catch (err) {
      console.error('Face detection model load error:', err);
      showToast('Failed to load face detection models. Please check your internet connection.', 'error');
    }
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      })
      .catch(() => showToast('Camera access denied', 'error'));
  };

  useEffect(() => {
    let interval: any;
    if (isCameraReady && videoRef.current) {
      interval = setInterval(async () => {
        if (videoRef.current) {
          const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
          setIsFaceDetected(!!detections);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isCameraReady]);

  const handlePunch = async (type: 'IN' | 'OUT') => {
    if (!isFaceDetected || !currentUser) return;
    setIsProcessing(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
      );
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current!.videoWidth;
      canvas.height = videoRef.current!.videoHeight;
      canvas.getContext('2d')!.drawImage(videoRef.current!, 0, 0);
      
      await api.punch({
        mobile: currentUser.mobile,
        type,
        timestamp: new Date().toISOString(),
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        photo: canvas.toDataURL('image/jpeg', 0.5)
      });

      showToast(`Punched ${type} successfully!`);
      fetchAttendanceRecords();
    } catch (err) {
      showToast('Punch failed. Check GPS/Camera.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.submitLeave({ ...newLeave, user_id: currentUser.id });
      showToast('Leave request submitted!');
      setShowLeaveForm(false);
      setNewLeave({ type: 'Sick Leave', start_date: '', end_date: '', reason: '', attachment: '' });
      fetchLeaves();
    } catch (err) {
      showToast('Failed to submit leave', 'error');
    }
  };

  const handleLeaveFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewLeave({ ...newLeave, attachment: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const hasPunchedInToday = todayRecords.some(r => r.type === 'IN');
  const hasPunchedOutToday = todayRecords.some(r => r.type === 'OUT');

  return {
    videoRef,
    isModelLoaded,
    isCameraReady,
    isFaceDetected,
    isProcessing,
    staffTab,
    setStaffTab,
    todayRecords,
    yesterdayRecords,
    leaves,
    holidays,
    payslips,
    showLeaveForm,
    setShowLeaveForm,
    newLeave,
    setNewLeave,
    handlePunch,
    handleLeaveSubmit,
    handleLeaveFileChange,
    hasPunchedInToday,
    hasPunchedOutToday
  };
};
