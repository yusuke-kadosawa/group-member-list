import React from "react";
import { useParams } from "next/navigation";

export default function CalendarMonthPage() {
  // パラメータ取得
  // const { year, month } = useParams(); // サーバーコンポーネントでは props で受け取る
  return (
    <div>
      <h1>月カレンダー（パス指定）</h1>
      {/* TODO: カレンダーUI・活動表示 */}
    </div>
  );
}
