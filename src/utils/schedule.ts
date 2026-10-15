// Utility for WIB (Waktu Indonesia Barat, UTC+7) Clinic Schedule & Timing

export interface WIBTimeInfo {
  hour: number;
  minute: number;
  second: number;
  timeString: string;
  dateString: string;
  isWithinHours: boolean;
  minutesUntilClose?: number;
  minutesUntilOpen?: number;
}

/**
 * Calculates current time in WIB (Asia/Jakarta, UTC+7)
 */
export function getWIBTime(): WIBTimeInfo {
  const now = new Date();
  
  // Format to Asia/Jakarta timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const findPart = (type: string) => parts.find((p) => p.type === type)?.value || '0';

  const hour = parseInt(findPart('hour'), 10);
  const minute = parseInt(findPart('minute'), 10);
  const second = parseInt(findPart('second'), 10);
  const year = findPart('year');
  const month = findPart('month');
  const day = findPart('day');

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeString = `${pad(hour)}:${pad(minute)}:${pad(second)} WIB`;
  const dateString = `${year}-${month}-${day}`;

  // Clinic Open Hours: 08:00 to 21:00 WIB
  // Open if 08:00 <= time < 21:00
  const isWithinHours = hour >= 8 && hour < 21;

  // Minutes calculation
  const totalMinutesNow = hour * 60 + minute;
  const openMinutes = 8 * 60; // 480 (08:00)
  const closeMinutes = 21 * 60; // 1260 (21:00)

  let minutesUntilClose: number | undefined;
  let minutesUntilOpen: number | undefined;

  if (isWithinHours) {
    minutesUntilClose = closeMinutes - totalMinutesNow;
  } else {
    if (totalMinutesNow < openMinutes) {
      minutesUntilOpen = openMinutes - totalMinutesNow;
    } else {
      // After 21:00, until tomorrow 08:00
      minutesUntilOpen = 24 * 60 - totalMinutesNow + openMinutes;
    }
  }

  return {
    hour,
    minute,
    second,
    timeString,
    dateString,
    isWithinHours,
    minutesUntilClose,
    minutesUntilOpen,
  };
}

/**
 * Gets the automatic clinic status based on 08:00 - 21:00 WIB
 */
export function computeAutoClinicStatus(): {
  isOpen: boolean;
  reason: string;
  reopenEstimate: string;
} {
  const wib = getWIBTime();
  if (wib.isWithinHours) {
    return {
      isOpen: true,
      reason: '',
      reopenEstimate: 'Operasional normal buka sampai 21:00 WIB',
    };
  } else {
    let reopenText = 'Buka kembali pukul 08:00 WIB';
    if (wib.minutesUntilOpen !== undefined && wib.minutesUntilOpen <= 60) {
      reopenText = `Buka kembali dalam ${wib.minutesUntilOpen} menit (08:00 WIB)`;
    } else if (wib.hour >= 21) {
      reopenText = 'Buka kembali besok pagi pukul 08:00 WIB';
    } else {
      reopenText = 'Buka kembali pagi ini pukul 08:00 WIB';
    }

    return {
      isOpen: false,
      reason: 'Di luar jam operasional praktik klinik (08:00 - 21:00 WIB)',
      reopenEstimate: reopenText,
    };
  }
}
