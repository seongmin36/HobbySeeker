import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Puzzle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Puzzle className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-gray-900">HobbyConnect</h1>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              로그인
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              당신만의 특별한 취미를 찾아보세요
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              AI가 분석한 맞춤형 취미 추천과 함께하는 커뮤니티
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90"
              >
                취미 추천 받기
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
              >
                동호회 둘러보기
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI 맞춤 추천</h3>
              <p className="text-gray-600">
                개인의 성향과 선호도를 분석하여 완벽한 취미를 추천합니다
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-secondary rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">지역 기반 매칭</h3>
              <p className="text-gray-600">
                내 주변의 동호회와 번개 모임을 쉽게 찾아보세요
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">실시간 커뮤니티</h3>
              <p className="text-gray-600">
                채팅과 모임을 통해 새로운 인연을 만나보세요
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            지금 시작해보세요
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            무료로 가입하고 새로운 취미 여행을 시작하세요
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90"
          >
            무료로 시작하기
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Puzzle className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-xl font-bold">HobbyConnect</h3>
              </div>
              <p className="text-gray-400">AI 기반 맞춤형 취미 추천과 커뮤니티 플랫폼</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>취미 추천</li>
                <li>동호회 찾기</li>
                <li>커뮤니티</li>
                <li>이벤트</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>고객센터</li>
                <li>이용약관</li>
                <li>개인정보처리방침</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">연락처</h4>
              <ul className="space-y-2 text-gray-400">
                <li>이메일: info@hobbyconnect.com</li>
                <li>전화: 02-1234-5678</li>
                <li>주소: 서울시 강남구 테헤란로 123</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HobbyConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
