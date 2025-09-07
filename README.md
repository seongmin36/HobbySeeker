# 🧭 취찾사(HobbySeeker) — 1인 가구를 위한 `이색 취미 추천` & 커뮤니티 with `Vive Coding`

> 사용자의 정보와 취향을 바탕으로 **Gemini API**가 이색 취미를 추천하고, **동호회/번개 모임**을 만들거나 참여하며, **실시간 채팅**으로 소통할 수 있는 웹앱  
> **스택**: Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Firebase Auth · Firestore · Geolocation (GPS)

<br>

<img width="1259" height="925" alt="스크린샷 2025-09-07 오후 10 15 31" src="https://github.com/user-attachments/assets/9babd96d-5651-49cf-ba3f-afab71edcc09" />


---

## ✨ 주요 기능

- **사용자 정보 수집 폼**
  - 성별, 나이, MBTI, 블랙리스트 취미, 예산, 취미에 들일 수 있는 시간, 네트워킹 여부, `이색 수준` 등 입력
- **취미 추천 (Gemini API)**
  - 입력값 기반으로 AI가 `이색` 취미 추천
- **커뮤니티 기능**
  - 동호회 생성/가입 (인원 수, 소개, 오픈카톡 링크)
  - 위치 기반 동호회/번개 모임 조회
- **실시간 채팅 (Firestore)**
  - 동호회/번개 전용 채팅방 지원
- **프로필 기능**
  - 로그인/회원가입, 프로필 편집, 관심사 저장

---

## 🏗️ 기술 스택

- **Frontend**: Next.js 14+, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend (BaaS)**: Firebase Authentication, Cloud Firestore
- **AI**: Gemini API (Google Generative AI)
- **위치 서비스**: HTML5 Geolocation API (+ 지도 SDK 선택)
