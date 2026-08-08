# 설정 가이드

## GitHub Secrets 등록

AI 리뷰에 사용할 LLM API 키를 GitHub Secrets에 등록합니다.

### CLI로 등록

```bash
# Kimi (Moonshot AI)
gh secret set KIMI_API_KEY --body "your-api-key"

# Anthropic
gh secret set ANTHROPIC_API_KEY --body "your-api-key"

# Google
gh secret set GOOGLE_API_KEY --body "your-api-key"

# DeepSeek
gh secret set DEEPSEEK_API_KEY --body "your-api-key"

# OpenAI
gh secret set OPENAI_API_KEY --body "your-api-key"

# z.ai (Zhipu GLM)
gh secret set ZAI_API_KEY --body "your-api-key"

# NVIDIA NIM (build.nvidia.com)
gh secret set NVIDIA_API_KEY --body "your-api-key"
```

### 웹에서 등록

1. GitHub 레포 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name에 `KIMI_API_KEY` 등 입력, Secret에 API 키 입력

> 사용하지 않는 provider의 키는 등록하지 않아도 됩니다. `ai-review-agents.yml`에서 해당 provider를 사용하는 에이전트가 없으면 해당 키는 불필요합니다.

## ai-review-agents.yml 전체 레퍼런스

### agents 섹션

각 에이전트별 LLM provider, model, 프롬프트 파일을 지정합니다.

```yaml
agents:
  <agent_name>:
    provider: kimi | anthropic | google | deepseek | openai | zai | nvidia  # 필수
    model: <model_id>                      # 필수
    prompt_file: <path>                    # 필수 (prompts/ 기준 상대경로)
    temperature: <0.0~2.0>                 # 선택, 기본 0.3
    max_tokens: <number>                   # 선택, 기본 4096
    confidence_threshold: <0.0~1.0>        # resolver 전용, 기본 0.8
```

| 에이전트 | 역할 | 실행 시점 |
|---------|------|----------|
| `quality` | 코드 품질 검토 (네이밍, 구조, 중복, 에러 핸들링) | PR opened/reopened/push |
| `performance` | 성능 검토 (복잡도, 메모리, N+1, 캐싱) | PR opened/reopened/push |
| `security` | 보안 검토 (인젝션, XSS, 시크릿 노출) | PR opened/reopened/push |
| `orchestrator` | 3개 결과 병합, 중복 제거, false positive 필터링 | PR opened/reopened/push |
| `resolver` | 이전 코멘트 해결 여부 자동 판정 | push (synchronize) |
| `responder` | @bot 멘션에 대한 질문 답변 | 코멘트 생성 |

### NVIDIA NIM 모델 ID 형식

NVIDIA NIM(provider: `nvidia`)은 다른 provider와 달리 모델 ID가 `네임스페이스/모델명` 형식입니다.

```yaml
agents:
  quality:
    provider: nvidia
    model: meta/llama-3.3-70b-instruct   # "llama-3.3-70b-instruct"가 아님
    prompt_file: prompts/quality.md
```

예시 모델 (2026-08 기준 카탈로그에서 확인):

| 모델 ID | 비고 |
|---------|------|
| `meta/llama-3.3-70b-instruct` | 범용 instruct |
| `nvidia/llama-3.1-nemotron-70b-instruct` | NVIDIA 튜닝 instruct |
| `nvidia/llama-3.3-nemotron-super-49b-v1.5` | reasoning 계열 |
| `openai/gpt-oss-120b` | 오픈웨이트 GPT |
| `deepseek-ai/deepseek-v4-flash-0731` | DeepSeek 계열 |

- API 키 발급과 전체 모델 목록은 [build.nvidia.com](https://build.nvidia.com)에서 확인합니다.
- 무료 티어는 분당 요청 수 제한이 낮으므로, 여러 에이전트를 모두 nvidia로 지정하면 429가 발생할 수 있습니다(자동 재시도 3회).
- reasoning 계열 모델은 사고 과정(`<think>`)이 응답에 섞일 수 있어 리뷰 용도로는 instruct 계열을 권장합니다.

### triggers 섹션

```yaml
triggers:
  review_on: [opened, reopened]     # 리뷰 실행 트리거 (기본값)
  resolve_on: [synchronize]         # Resolver 실행 트리거 (기본값)
  respond_to: "@review-bot"         # Responder 트리거 키워드 (기본값)
```

### options 섹션

```yaml
options:
  language: ko                       # 리뷰 응답 언어 (기본: ko)
  max_comments_per_review: 20        # PR당 최대 코멘트 수 (기본: 20)
  review_draft_pr: false             # Draft PR 리뷰 여부 (기본: false)
  skip_bot_prs: true                 # Bot PR 스킵 (기본: true)
  exclude_files:                     # 리뷰 제외 파일 패턴 (glob)
    - "*.lock"
    - "*.generated.*"
    - "dist/**"
    - "node_modules/**"
```

## 트러블슈팅

### API 키 관련
- **"Missing environment variable: KIMI_API_KEY"** → GitHub Secrets에 키가 등록되지 않음
- **"429 rate limit"** → API rate limit 초과. 자동 재시도(최대 3회)하지만, 지속되면 요청 빈도 확인

### 리뷰 관련
- **리뷰가 달리지 않음** → Actions 탭에서 워크플로우 실행 로그 확인. Draft PR이면 `review_draft_pr: true` 설정
- **너무 많은 코멘트** → `max_comments_per_review` 값을 줄이거나 `exclude_files` 패턴 추가
- **잘못된 리뷰** → `prompts/` 폴더의 프롬프트 수정 ([프롬프트 가이드](prompt-guide.md) 참고)
