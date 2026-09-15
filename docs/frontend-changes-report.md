# TriVisionX Frontend Changes Report

**Period:** 4 Aug 2026 – 14 Sep 2026
**Scope:** Landing page, sign-in page, sign-up page, navigation, footer, and shared marketing UI components
**Total commits:** 54 (`1430c60..63058a5` on `feature-branch`)

---

## Summary of Changes

| Area | Then (Before) | Now (After) |
| --- | --- | --- |
| Hero section | Tight padding, flat feature chips, plain pipeline badge, no trust messaging | More breathing room, hover feedback on chips, emerald "live" pipeline badge, trust bar under CTAs ("No credit card required · 10k cycles/month") |
| Logo marquee | "Trusted by industry leaders", heavy padding, no interaction | "Trusted by teams shipping agentic experiences", tighter spacings |
| Bento grid | Sharp section padding, default card hover borders, thin stat rows | Balanced padding, stronger hover border (`primary/50`), refined workflow animation timing, bigger description text |
| Feature showcase | Dense headings, hard section dividers, thick area chart stroke / progress bars | Looser line heights, softer dividers, slimmer charts, smoother log-entry hover and modal blur |
| Footer | Short one-line tagline, plain links & status pill | Expanded tagline (research workflows), refined status pill, consistent hover, lighter font weights |
| Sign-in | Generic subtitle, long placeholder, no autcomplete hints, flat card shadow | Clearer subtitle, `name@company.com` placeholder, `email`/`current-password` autocomplete, deeper shadow, wider form spacing |
| Sign-up | Generic subtitle, no autocomplete hints, inconsistent labels, tight spacing | Clearer subtitle, `given-name`/`family-name` autocomplete, `Username *` label, roomier spacing and card shadow |
| Auth pages | `rounded-md` home button, harsh error/success banners | Consistency with landing (rounded-lg), softer banner padding, depth-matched cards |
| Marketing layout | Hardcoded `dark` class | Clean layout handling via theme provider |

---

## Date-wise Change Log

### August 2026

#### 4 Aug 2026 (5 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 1 | fix: adjust hero section padding | Landing – Hero | Section inner padding increased (`px-6`, `pt-32 pb-24`) → better viewport balance |
| 2 | style: primary color for similarity badges | Landing – Bento grid | Retrieval "x% sim" badges emerald → primary theme color |
| 3 | feat: enable logo animation in navbar | Navbar | Navbar logo static → subtle animated idle motion |
| 4 | style: tighten navbar mobile menu spacing | Navbar | Mobile menu item padding `px-4 py-3 / gap-2` → `px-3.5 py-2.5 / gap-1.5` |
| 5 | a11y: focus-visible ring on mobile menu toggle | Navbar | Toggle had no keyboard focus state → added ring + rounded-md |

#### 6 Aug 2026 (5 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 6 | copy: expand footer brand description | Footer | "orchestration and context retrieval engines" → adds autonomous research workflows |
| 7 | style: bump footer GitHub link weight | Footer | Link `font-normal` → `font-medium` for readability |
| 8 | style: tint hero pipeline badge emerald | Landing – Hero | Badge text muted → emerald matching live status dot |
| 9 | feat: hover feedback on feature pill chips | Landing – Hero | Chips static → hover brightens background/text |
| 10 | feat: trust bar under hero CTAs | Landing – Hero | Nothing → "No credit card required · free tier 10k cycles/month" |

#### 9 Aug 2026 (5 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 11 | copy: refresh logo marquee heading | Landing – Marquee | "Trusted by industry leaders" → "Trusted by teams shipping agentic experiences" |
| 12 | style: reduce marquee section padding | Landing – Marquee | `py-16` → `py-12` |
| 13 | style: tighten bento grid section padding | Landing – Bento | `py-24` → `py-20` |
| 14 | copy: update CTA button label | Landing – Final CTA | "View Pricing" → "Get Started Free" |
| 15 | style: increase final CTA card opacity | Landing – Final CTA | Card `bg-card/60` → `bg-card/70` for contrast |

#### 11 Aug 2026 (4 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 16 | copy: refine sign-in subtitle | Sign-in | "Enter your account credentials…" → "Sign in to access your dashboards and agent workspace." |
| 17 | feat: autocomplete + simpler email placeholder | Sign-in | Long placeholder → `name@company.com`, added `autocomplete="email"` |
| 18 | feat: current-password autocomplete hint | Sign-in | Password field → added `autocomplete="current-password"` |
| 19 | style: home button radius | Sign-in | `rounded-md` → `rounded-lg` (matches design system) |

#### 13 Aug 2026 (4 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 20 | copy: refine sign-up subtitle | Sign-up | "Join TriVisionX AI platform in seconds." → "Get started with TriVisionX in under a minute." |
| 21 | feat: name autocomplete hints | Sign-up | First/last name → `given-name` / `family-name` autocomplete |
| 22 | style: fix input indentation | Sign-up | Malformed indentation → consistent 18-space indent |
| 23 | style: marketing layout structure | Layout | Hardcoded `dark` class removed (handled by ThemeProvider) |

#### 18 Aug 2026 (5 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 24 | style: feature showcase heading line height | Showcase | `leading-tight` → `leading-[1.15]` (4 headings) |
| 25 | copy: refine bento grid subtitle | Landing – Bento | Margin bottom `mb-6` → `mb-8` |
| 26 | style: soften hero glow | Landing – Hero | Blur 140px/opacity .10 → 120px / .07 |
| 27 | style: signup error padding | Sign-up | Error banner `px-3 py-2.5` → `px-3.5 py-3` |
| 28 | style: login success padding | Sign-in | Success banner `px-3 py-2.5` → `px-3.5 py-3` |

#### 21 Aug 2026 (4 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 29 | style: softer section dividers | Showcase | 4 section borders `border-border` → `border-border/60` |
| 30 | style: workflow animation timing | Landing – Bento | Agent visual tick 2.0s → 2.4s (calmer pulse) |
| 31 | style: footer heading size | Footer | Column headings `text-xs` → `text-[11px]` |
| 32 | style: footer copyright size | Footer | Copyright `text-xs` → `text-[11px]` |

#### 25 Aug 2026 (3 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 33 | style: hero headline letter spacing | Landing – Hero | Leading `1.1` → `1.05` (tighter masthead) |
| 34 | style: bento card hover border | Landing – Bento | All 5 cards `hover:border-primary/40` → `/50` |
| 35 | style: area chart stroke thinner | Showcase | TPS stroke width 3 → 2 |

---

### September 2026

#### 1 Sep 2026 (2 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 36 | style: quieter grid mesh | Landing – Hero | Grid line opacity border/0.3 → border/0.25 |
| 37 | style: log entry hover | Showcase | Log rows `py-2 px-3`, instant hover → `py-2.5 px-3.5`, 200ms ease |

#### 4 Sep 2026 (4 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 38 | style: report success badge weight | Landing – Bento | Report "SUCCESS" badge → removed redundant `font-bold` |
| 39 | style: footer status pill | Footer | Pill `bg-muted border-border` → translucent `bg-muted/60 border-border/60` |
| 40 | style: hero CTA gap | Landing – Hero | Button gap `3.5` → `4` |
| 41 | copy: username label consistency | Sign-up | "Username" → "Username *" (marks required) |

#### 8 Sep 2026 (4 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 42 | style: modal backdrop blur | Showcase | Log inspector `backdrop-blur-sm` → `backdrop-blur-md` |
| 43 | style: login form spacing | Sign-in | Field stack `space-y-4` → `space-y-5` |
| 44 | style: signup form spacing | Sign-up | Field stack `space-y-4` → `space-y-5` |
| 45 | style: hero pill bar spacing | Landing – Hero | Chip gap `3` → `2.5` |

#### 11 Sep 2026 (4 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 46 | style: progress bar slimmer | Showcase | Model usage bars `h-2` → `h-1.5` |
| 47 | style: workflow node padding | Landing – Bento | On-canvas node card `p-3` → `p-3.5` |
| 48 | style: CTA fine print size | Landing – Final CTA | "Free tier / SLA" text `text-xs` → `text-[11px]` |
| 49 | style: login card shadow depth | Sign-in | `shadow-2xl` → custom deep `rgba(0,0,0,0.5)` spread shadow |

#### 14 Sep 2026 (5 commits)
| # | Commit | Feature | Then → Now |
| --- | --- | --- | --- |
| 50 | style: signup card shadow depth | Sign-up | `shadow-2xl` → deep custom shadow (matches login) |
| 51 | style: showcase badge padding | Showcase | 4 section badges `px-3` → `px-3.5` |
| 52 | style: bento description size | Landing – Bento | Feature card description `text-xs` → `text-sm` |
| 53 | style: hero badge chevron color | Landing – Hero | Chevron muted → emerald (matches live badge) |
| 54 | style: footer heading weight | Footer | Column headings `font-bold` → `font-semibold` |

---

## Files Modified

| File | Commits |
| --- | --- |
| `frontend/components/hero.tsx` | 11 |
| `frontend/components/navbar.tsx` | 4 |
| `frontend/components/footer.tsx` | 7 |
| `frontend/components/bento-grid.tsx` | 8 |
| `frontend/components/feature-showcase-sections.tsx` | 9 |
| `frontend/components/logo-marquee.tsx` | 2 |
| `frontend/components/final-cta.tsx` | 4 |
| `frontend/app/(root)/(auth)/signup/[[...sign-up]]/page.tsx` | 9 |
| `frontend/app/(root)/(auth)/login/[[...sign-in]]/page.tsx` | 8 |
| `frontend/app/(marketing)/layout.tsx` | 1 |