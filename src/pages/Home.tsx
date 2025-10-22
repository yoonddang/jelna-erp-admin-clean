const homeIllustration = new URL("../assets/home-illustration.svg", import.meta.url).href;

export default function Home() {
  return (
    <div className="home-page">
      <h2 className="home-page__title">홈</h2>
      <p className="home-page__description">
        상단 대메뉴에서 기능을 선택하세요. 배송관리에서 엑셀 기반 일괄 배송처리를 수행할 수 있습니다.
      </p>
      <div className="home-page__illustration-box">
        <img className="home-page__illustration" src={homeIllustration} alt="홈 안내 일러스트" />
      </div>
    </div>
  );
}
