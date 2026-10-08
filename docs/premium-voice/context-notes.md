# 컨텍스트 노트
- **웹만 수정.** 모바일(Expo) 앱에는 발음 재생 기능이 아예 없어서 고칠 대상이 없음. 추가는 별도 작업.
- **사전 API 녹음 우선 순서는 유지.** 단어 하나일 때 dictionaryapi.dev의 사람 녹음을 먼저 재생하고, 없거나 구문일 때만 TTS로 넘어감. 기계음은 이 fallback에서 났음.
- **이름과 voiceURI 둘 다 검사.** Safari는 voiceURI에 `com.apple.voice.premium...`을 넣고, 로케일에 따라 이름이 "(프리미엄)", "(향상됨)"으로 나올 수 있음.
- **고품질 음성이 없으면 voice를 지정하지 않음.** macOS에는 Albert, Zarvox 같은 장난 음성이 많아서 아무 영어 음성이나 고르면 오히려 나빠짐.
