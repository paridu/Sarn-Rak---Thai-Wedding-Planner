
import React from 'react';
import { RitualTask } from './types';

export const INITIAL_RITUALS: RitualTask[] = [
  { id: '1', title: 'พิธีสงฆ์ (Buddhist Ceremony)', description: 'การทำบุญตักบาตรและถวายสังฆทานเพื่อความเป็นสิริมงคล', isCompleted: false, order: 1 },
  { id: '2', title: 'ขบวนแห่ขันหมาก (Khan Maak)', description: 'ฝ่ายชายแห่ขบวนนำสินสอดทองหมั้นมาบ้านฝ่ายหญิง', isCompleted: false, order: 2 },
  { id: '3', title: 'พิธีเจรจาสินสอดและตรวจนับ (Engagement)', description: 'เฒ่าแก่เจรจาฝากฝังและเปิดพานตรวจนับสินสอด', isCompleted: false, order: 3 },
  { id: '4', title: 'พิธีสวมแหวน (Ring Exchange)', description: 'การสวมแหวนหมั้นอย่างเป็นทางการต่อหน้าพยาน', isCompleted: false, order: 4 },
  { id: '5', title: 'พิธีหลั่งน้ำพระพุทธมนต์ (Water Pouring)', description: 'พิธีรับน้ำสังข์จากญาติผู้ใหญ่เพื่อการเริ่มต้นชีวิตคู่', isCompleted: false, order: 5 },
  { id: '6', title: 'พิธีไหว้ผู้ใหญ่ (Paying Respect)', description: 'การมอบของขวัญและขอพรจากญาติผู้ใหญ่ทั้งสองฝ่าย', isCompleted: false, order: 6 },
  { id: '7', title: 'พิธีฉลองมงคลสมรส (Wedding Reception)', description: 'งานเลี้ยงฉลองช่วงเย็นสำหรับแขกเหรื่อ', isCompleted: false, order: 7 },
  { id: '8', title: 'พิธีส่งตัวเข้าหอ (Nuptial Bed)', description: 'พิธีเรียบที่นอนและปูเตียงโดยผู้ใหญ่ที่มีคู่ครองครองรักกันยาวนาน', isCompleted: false, order: 8 },
];

export const CATEGORIES = [
  'สถานที่ (Venue)',
  'อาหารและเครื่องดื่ม (Catering)',
  'เครื่องแต่งกาย (Attire)',
  'ช่างภาพและวิดีโอ (Photo/Video)',
  'ของชำร่วยและบัตรเชิญ (Favors/Invites)',
  'ตกแต่งสถานที่ (Decor)',
  'แต่งหน้าทำผม (Makeup/Hair)',
  'อื่นๆ (Others)'
];
