/**
 * Computes the trial status based on booking start date
 * Trial starts: when current date = start date AND current time > 5PM
 * Trial ends: 3 days after trial started
 */

export interface TrialStatusResult {
  status: 'pending' | 'confirmed' | 'trial_started' | 'trial_ended' | string;
  label: string;
  color: string;
  daysRemaining?: number;
}

export function computeTrialStatus(
  startDate: string,
  currentStatus: string
): TrialStatusResult {
  // If booking is cancelled or completed, don't override
  if (currentStatus === 'cancelled' || currentStatus === 'completed') {
    return {
      status: currentStatus,
      label: currentStatus === 'cancelled' ? 'Cancelled' : 'Completed',
      color: currentStatus === 'cancelled' 
        ? 'bg-red-100 text-red-700' 
        : 'bg-gray-100 text-gray-700'
    };
  }

  const now = new Date();
  const bookingStartDate = new Date(startDate);
  
  // Set the trial start time to 5 PM on the start date
  const trialStartTime = new Date(bookingStartDate);
  trialStartTime.setHours(17, 0, 0, 0); // 5 PM
  
  // Trial ends 3 days after trial start time
  const trialEndTime = new Date(trialStartTime);
  trialEndTime.setDate(trialEndTime.getDate() + 3);

  // Check if current date is same as start date (comparing only date parts)
  const isSameDay = 
    now.getFullYear() === bookingStartDate.getFullYear() &&
    now.getMonth() === bookingStartDate.getMonth() &&
    now.getDate() === bookingStartDate.getDate();

  // Check if we're past the start date
  const isPastStartDate = now.getTime() > bookingStartDate.setHours(23, 59, 59, 999);
  
  // Calculate if trial has started (same day after 5 PM OR past start date)
  const hasTrialStarted = (isSameDay && now.getHours() >= 17) || isPastStartDate;
  
  // Calculate if trial has ended (3 days after 5 PM on start date)
  const hasTrialEnded = now.getTime() >= trialEndTime.getTime();

  if (hasTrialEnded) {
    return {
      status: 'trial_ended',
      label: 'Trial Ended',
      color: 'bg-purple-100 text-purple-700'
    };
  }

  if (hasTrialStarted) {
    // Calculate days remaining
    const msRemaining = trialEndTime.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    
    return {
      status: 'trial_started',
      label: 'Trial Started',
      color: 'bg-blue-100 text-blue-700',
      daysRemaining
    };
  }

  // Trial hasn't started yet, return original status
  if (currentStatus === 'confirmed') {
    return {
      status: 'confirmed',
      label: 'Confirmed',
      color: 'bg-green-100 text-green-700'
    };
  }

  return {
    status: currentStatus,
    label: currentStatus === 'pending' ? 'Pending' : currentStatus,
    color: 'bg-amber-100 text-amber-700'
  };
}

/**
 * Hindi labels for trial status
 */
export function getTrialStatusHindi(status: string): string {
  const hindiLabels: Record<string, string> = {
    pending: 'लंबित',
    confirmed: 'पुष्टि',
    trial_started: 'ट्रायल शुरू',
    trial_ended: 'ट्रायल समाप्त',
    cancelled: 'रद्द',
    completed: 'पूर्ण'
  };
  return hindiLabels[status] || status;
}
