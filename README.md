# AI Code Review

GitHub Actions 기반 AI 코드리뷰 시스템. PR이 열리면 3개 전문 에이전트가 병렬로 코드를 검토하고, Orchestrator가 결과를 종합하여 inline review comment를 자동 게시합니다.

## 아키텍처

```
GitHub webhook events
    │
    ▼
Event Dispatcher (이벤트 분류 + 라우팅)
    │
    ├── PR opened/reopened ──→ Review Pipeline
    │                          ├── Quality Agent (코드 품질)
    │                          ├── Performance Agent (성능)  ──→ Orchestrator ──→ GitHub Comments
    │                          └── Security Agent (보안)
    │
    ├── push (synchronize) ──→ Resolver (자동 해결) → Review Pipeline
    │
    └── @bot comment ────────→ Responder (질문 답변)
```

## 빠른 시작

### 1. `ai-review-agents.yml` 설정 파일 작성

프로젝트 루트에 `ai-review-agents.yml`을 생성합니다 (`templates/ai-review-agents.yml` 참고):

```yaml
agents:
  quality:
    provider: anthropic
    model: claude-sonnet-4-6
    prompt_file: prompts/quality.md
  performance:
    provider: kimi
    model: kimi-k2-thinking
    prompt_file: prompts/performance.md
    temperature: 1
  security:
    provider: anthropic
    model: claude-opus-4-6
    prompt_file: prompts/security.md
  orchestrator:
    provider: google
    model: gemini-2.5-flash
    prompt_file: prompts/orchestrator.md
    max_tokens: 8192
  resolver:
    provider: anthropic
    model: claude-sonnet-4-6
    prompt_file: prompts/resolver.md
    temperature: 1
    confidence_threshold: 0.8
  responder:
    provider: anthropic
    model: claude-sonnet-4-6
    prompt_file: prompts/responder.md

options:
  language: ko
  max_comments_per_review: 20
  exclude_files:
    - "*.lock"
    - "dist/**"
```

### 2. GitHub Secrets 등록

```bash
gh secret set KIMI_API_KEY --body "your-kimi-api-key"
gh secret set ANTHROPIC_API_KEY --body "your-anthropic-api-key"
gh secret set GOOGLE_API_KEY --body "your-google-api-key"
gh secret set DEEPSEEK_API_KEY --body "your-deepseek-api-key"
gh secret set OPENAI_API_KEY --body "your-openai-api-key"
```

### 3. GitHub Actions 워크플로우 추가

`templates/workflow.yml`을 `.github/workflows/ai-review.yml`로 복사합니다.

### 4. PR 열어서 테스트

PR을 열면 자동으로 AI 리뷰가 실행됩니다.

## 설정 옵션 요약

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `language` | string | `ko` | 리뷰 응답 언어 |
| `max_comments_per_review` | number | `20` | PR당 최대 코멘트 수 |
| `review_draft_pr` | boolean | `false` | Draft PR 리뷰 여부 |
| `skip_bot_prs` | boolean | `true` | Bot PR 스킵 여부 |
| `exclude_files` | string[] | `["*.lock", ...]` | 리뷰 제외 파일 패턴 |

## 지원 Provider

| Provider | 환경변수 | 모델 예시 | 비고 |
|----------|---------|----------|------|
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-6, claude-opus-4-6 | 네이티브 SDK |
| Google | `GOOGLE_API_KEY` | gemini-2.5-flash, gemini-2.5-pro | 네이티브 SDK |
| Kimi (Moonshot) | `KIMI_API_KEY` | kimi-k2.5, kimi-k2-thinking | OpenAI 호환 |
| DeepSeek | `DEEPSEEK_API_KEY` | deepseek-chat, deepseek-reasoner | OpenAI 호환 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o, gpt-4o-mini | OpenAI 호환 |

## 상세 문서

- [설정 가이드](docs/setup-guide.md) — 전체 설정 옵션 레퍼런스, 모델 추천
- [프롬프트 커스터마이즈 가이드](docs/prompt-guide.md) — 프롬프트 수정 방법, 검토 항목 변경
