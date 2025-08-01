import { DateTime } from 'luxon';

export function calculateOvertime(dateString, inTimeString, outTimeString, standardDutyMinutes) {
  if (!inTimeString || !outTimeString || !standardDutyMinutes) {
    return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
  }

  const timeZone = 'Asia/Dhaka'; // আপনার নির্দিষ্ট টাইমজোন

  try {
    // Luxon ব্যবহার করে লোকাল সময়কে সঠিক DateTime অবজেক্টে রূপান্তর
    let inTime = DateTime.fromFormat(`${dateString} ${inTimeString}`, 'yyyy-MM-dd HH:mm', { zone: timeZone });
    let outTime = DateTime.fromFormat(`${dateString} ${outTimeString}`, 'yyyy-MM-dd HH:mm', { zone: timeZone });

    // রাত ১২টার পর আউট হলে তারিখ একদিন বাড়ানো
    if (outTime < inTime) {
      outTime = outTime.plus({ days: 1 });
    }

    // মিনিটের পার্থক্য হিসাব করা
    const diff = outTime.diff(inTime, 'minutes').toObject();
    const totalMinutes = diff.minutes || 0;

    if (totalMinutes < 0) return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };

    let overtimeMinutes = 0;
    if (totalMinutes > standardDutyMinutes) {
      overtimeMinutes = totalMinutes - standardDutyMinutes;
    }

    const dutyHours = parseFloat((totalMinutes / 60).toFixed(2));
    const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));

    // MongoDB-তে সেভ করার জন্য JavaScript Date অবজেক্টে রূপান্তর
    return { dutyHours, overtimeHours, inTime: inTime.toJSDate(), outTime: outTime.toJSDate() };
  
  } catch (error) {
    console.error("Error in Luxon time calculation:", error);
    return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
  }
}