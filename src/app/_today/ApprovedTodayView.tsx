"use client";

/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */
import { useRef, type CSSProperties, type FormEvent } from "react";
import type { TodayPromiseSlide, TodayViewActions, TodayViewModel } from "@/features/today/contracts";
import { LOCAL_MEDIA_SOURCE_NOTICE } from "@/features/today/today-data";

type CustomProperties = CSSProperties & Record<`--${string}`, string | number>;

function ActionButtonContent({ label }: { label: string }) {
  const icon = label === "Generate Today's Journey" || label === "Start Today's Journey"
    ? "journey"
    : label === "Guardrails" || label === "Open Guardrails"
      ? "guardrails"
      : "";
  if (!icon) return label;
  return <><span className={`button-icon button-icon-${icon}`} aria-hidden="true"></span><span>{label}</span></>;
}

function artworkClass(slide: TodayPromiseSlide) {
  return `slide-${slide.title.toLowerCase().replace(/\s+/g, "-")}`;
}

function PromiseCarousel({ model, actions }: { model: TodayViewModel; actions: TodayViewActions }) {
  const pointerStart = useRef<number | null>(null);
  return (
    <section
      className="promise-carousel"
      id="todayPromiseCarousel"
      aria-label="Automated Today's Promise carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") actions.previousPromise();
        if (event.key === "ArrowRight") actions.nextPromise();
      }}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const delta = event.clientX - pointerStart.current;
        if (Math.abs(delta) > 40) {
          if (delta < 0) actions.nextPromise();
          else actions.previousPromise();
        }
        pointerStart.current = null;
      }}
      onMouseEnter={() => actions.setPromisePaused(true)}
      onMouseLeave={() => actions.setPromisePaused(false)}
    >
      <button className="carousel-arrow prev" id="carouselPrev" type="button" aria-label="Previous promise slide" onClick={actions.previousPromise}>←</button>
      <div className="carousel-viewport">
        <div className="carousel-track" id="promiseCarouselTrack" style={{ "--carousel-offset": "0%" } as CustomProperties}>
          {model.promiseSlides.map((slide, index) => {
            const active = index === model.activePromiseSlide;
            return (
              <article className={`carousel-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} key={slide.title}>
                <div className="carousel-copy">
                  <span className="slide-number">{String(index + 1).padStart(2, "0")} / {String(model.promiseSlides.length).padStart(2, "0")}</span>
                  <p className="eyebrow">{slide.kicker}</p>
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                  <div className="scripture-strip">{slide.scriptures.map((scripture) => <span className="scripture-pill" key={scripture}>{scripture}</span>)}</div>
                  <div className="carousel-cta-row">
                    <button className="primary action-icon-button" type="button" onClick={() => actions.activatePromiseAction(slide.cta)}><ActionButtonContent label={slide.cta} /></button>
                    <button className="secondary action-icon-button" type="button" onClick={() => actions.activatePromiseAction(slide.secondaryCta)}><ActionButtonContent label={slide.secondaryCta} /></button>
                  </div>
                </div>
                <div className={`slide-artwork banner-art ${slide.artwork} ${artworkClass(slide)}`} aria-hidden="true">
                  <img src={slide.image} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : undefined} />
                  <span className="art-glow"></span>
                  <span className="art-symbol"></span>
                </div>
              </article>
            );
          })}
        </div>
        <div id="promisePreviewRail">
          <div className="carousel-preview-rail" aria-hidden="true">
            {model.previewSlides.map((slide, index) => (
              <article className="preview-card" key={slide.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <img src={slide.image} alt="" loading="lazy" style={{ objectPosition: slide.position }} />
                <h4>{slide.title}</h4>
                <p>{slide.theme}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <button className="carousel-arrow next" id="carouselNext" type="button" aria-label="Next promise slide" onClick={actions.nextPromise}>→</button>
      <div className="carousel-dots" id="promiseCarouselDots" aria-label="Promise slide pagination">
        {model.promiseSlides.map((slide, index) => (
          <button
            className={index === model.activePromiseSlide ? "active" : ""}
            type="button"
            data-slide-index={index}
            aria-current={index === model.activePromiseSlide ? "true" : "false"}
            aria-label={`Go to ${slide.title} slide`}
            onClick={() => actions.selectPromise(index)}
            key={slide.title}
          ></button>
        ))}
      </div>
    </section>
  );
}

function FeaturedStories({ model, actions }: { model: TodayViewModel; actions: TodayViewActions }) {
  const pointerStart = useRef<number | null>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.submitSearch(model.searchQuery);
  };
  return (
    <article className="integration-card search-promise-card teoyubeworld-featured-panel" aria-labelledby="teoyubeworldFeaturedTitle">
      <div className="featured-story-panel-inner">
        <div className="featured-story-search-shell">
          <div className="featured-story-heading">
            <span className="featured-story-brand-icon" aria-hidden="true"></span>
            <div><p className="eyebrow">TeoyubeWorld Search</p><h3 id="teoyubeworldFeaturedTitle">Featured Stories</h3></div>
          </div>
          <p className="featured-story-lede">Search videos, teachings, devotionals, articles, and featured updates from TeoyubeWorld.</p>
          <form id="promiseMovieForm" className="promise-search-form" onSubmit={submit}>
            <label htmlFor="promiseMovieInput">Search TeoyubeWorld:</label>
            <input id="promiseMovieInput" name="search" type="text" placeholder="Search TeoyubeWorld..." value={model.searchQuery} onChange={(event) => actions.changeSearchQuery(event.target.value)} />
            <button className="primary" type="submit" aria-label="Search TeoyubeWorld">Search</button>
          </form>
          <div data-phase116-mounted="promiseMovieForm">
            <div className="phase116-search-suggestions" data-phase116-search-surface="ui-elements">
              <div><span className="eyebrow">Smart Search Suggestions</span><small>Session-only, sanitized, local suggestions.</small></div>
              <div className="phase116-chip-row">
                {model.searchSuggestions.map((suggestion) => (
                  <button
                    type="button"
                    className="phase116-chip"
                    data-phase116-action="use-search-suggestion"
                    data-phase116-query={suggestion}
                    data-phase116-input="promiseMovieInput"
                    onClick={() => actions.loadSearchSuggestion(suggestion)}
                    key={suggestion}
                  >{suggestion}</button>
                ))}
                <button type="button" className="phase116-chip subtle" data-phase116-action="clear-search-suggestions" onClick={actions.clearSearchSuggestions}>Clear</button>
              </div>
            </div>
          </div>
          <div className="search-chip-row" aria-label="TeoyubeWorld search filters">
            {[
              ["TeoyubeWorld", "Videos"],
              ["TeoyubeWorld teachings", "Teachings"],
              ["TeoyubeWorld devotionals", "Devotionals"],
              ["TeoyubeWorld articles", "Articles"]
            ].map(([query, label]) => (
              <button className={model.activeWorldQuery === query ? "active" : undefined} type="button" data-world-query={query} onClick={() => actions.submitSearch(query)} key={query}>{label}</button>
            ))}
          </div>
          <p className="muted small" id="promiseMovieStatus">{model.movieStatus}</p>
        </div>
        <div
          className="featured-story-carousel"
          id="featuredStoryCarousel"
          tabIndex={0}
          aria-label="Featured TeoyubeWorld stories"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); actions.previousStory(); }
            if (event.key === "ArrowRight") { event.preventDefault(); actions.nextStory(); }
          }}
          onPointerDown={(event) => { pointerStart.current = event.clientX; }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const delta = event.clientX - pointerStart.current;
            if (Math.abs(delta) > 42) {
              if (delta < 0) actions.nextStory();
              else actions.previousStory();
            }
            pointerStart.current = null;
          }}
          onMouseEnter={() => actions.setStoryPaused(true)}
          onMouseLeave={() => actions.setStoryPaused(false)}
        >
          <div className="featured-story-stage">
            {model.stories.map((story, index) => {
              const active = index === model.activeStoryIndex;
              return (
                <article className={`featured-story-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} style={{ "--featured-image": `url('${story.image}')` } as CustomProperties} key={story.id}>
                  <div className="featured-story-copy">
                    <div className="featured-story-meta"><span>{story.category}</span><span>{story.source}</span><time>{story.time}</time></div>
                    <h3>{story.title}</h3><p>{story.description}</p>
                    <div className="featured-story-actions">
                      <a className="primary featured-story-cta" href="#promiseMovieResult" target="_blank" rel="noreferrer noopener">{story.cta} <span aria-hidden="true">→</span></a>
                      <button className="secondary featured-story-select" type="button" data-featured-story-index={index} onClick={() => actions.selectStory(index)}>{story.secondaryCta}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="featured-story-controls" aria-label="Featured story carousel controls">
            <button className="featured-story-arrow" id="featuredStoryPrev" type="button" aria-label="Previous featured story" onClick={actions.previousStory}>←</button>
            <div className="featured-story-dots">
              {model.stories.map((story, index) => (
                <button className={index === model.activeStoryIndex ? "active" : ""} type="button" data-featured-story-index={index} aria-current={index === model.activeStoryIndex ? "true" : "false"} aria-label={`Show ${story.title}`} onClick={() => actions.selectStory(index)} key={story.id}></button>
              ))}
            </div>
            <button className="featured-story-arrow" id="featuredStoryNext" type="button" aria-label="Next featured story" onClick={actions.nextStory}>→</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TeoyubeWorldIntegrations({ model, actions }: { model: TodayViewModel; actions: TodayViewActions }) {
  const selected = model.stories[model.activeStoryIndex];
  return (
    <div className="today-integrations">
      <section className="teoyube-promise-panel">
        <article className="integration-card promise-movie-card" id="promiseMovieResult">
          <p className="eyebrow">TeoyubeWorld Video Highlight</p>
          <div className="promise-movie-detail">
            <div className="promise-video-thumbnail promise-youtube-frame">
              <iframe title={selected.title} srcDoc="<p>Video source not connected yet.</p>" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
              {!model.sourcePreviewOpened && <button className="promise-embed-play-overlay" type="button" data-video-id={selected.id} aria-label={`Play ${selected.title}`} onClick={actions.previewSource}><span>▶</span></button>}
            </div>
            <div className="promise-video-copy">
              <h3>{selected.title}</h3><span className="position-badge success">{selected.source}</span><p>{selected.description}</p>
              <p className="local-media-note">{LOCAL_MEDIA_SOURCE_NOTICE}</p>
              <div className="promise-video-actions">
                <button className="secondary watch-now-button" type="button" data-local-media-title={selected.title} onClick={actions.previewSource}>Preview Source Status</button>
                <div className="promise-video-nav" aria-label="TeoyubeWorld video navigation">
                  <button className="promise-video-nav-button" type="button" data-today-video-nav="previous" onClick={actions.previousStory}>Previous</button>
                  <button className="promise-video-nav-button" type="button" data-today-video-nav="next" onClick={actions.nextStory}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
      <section className="integration-card clients-promise-card">
        <div className="clients-card-header"><h3>TeoyubeWorld Feed</h3><button className="icon-menu" type="button" aria-label="Promise table menu">...</button></div>
        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead><tr><th>#</th><th>Title</th><th>Description</th><th>Video</th><th>Channel</th><th>Date</th></tr></thead>
            <tbody id="clientsPromiseRows">
              {model.stories.map((story, index) => (
                <tr className={index === model.activeStoryIndex ? "active-video-row" : ""} data-today-video-index={index} key={story.id}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td><div className="feed-video-title"><img src={story.image} alt="" /><span>{story.title}</span></div></td>
                  <td>{story.description}</td>
                  <td><button className="video-button today-video-select" type="button" data-today-video-index={index} aria-label={`Play ${story.title}`} onClick={() => actions.selectStory(index)}>Play</button></td>
                  <td><span className="position-badge success">{story.source}</span></td><td>{story.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function ApprovedTodayView({ model, actions }: { model: TodayViewModel; actions: TodayViewActions }) {
  const activeSlide = model.promiseSlides[model.activePromiseSlide];
  const progressPercent = model.journeyMoment?.progressPercent ?? 72;
  const progressItems = model.journeyMoment?.progressItems ?? [
    { label: "Prayer", complete: true },
    { label: "Scripture", complete: true },
    { label: "Reflection", complete: true },
    { label: "Assignment", complete: false }
  ];
  return (
    <section className="view page-container active" id="today" aria-labelledby="viewTitle">
      <div className="today-premium-shell">
        <PromiseCarousel model={model} actions={actions} />
        <section className="today-insight-row" aria-label="Today's promise summary">
          <article className="promise-detail-card"><p className="eyebrow">Today's Promise Animation</p><h3 id="dailyTheme">{activeSlide.title}</h3><p id="dailySummary">{activeSlide.theme}</p><div className="scripture-strip" id="dailyScriptures">{activeSlide.scriptures.map((scripture) => <span className="scripture-pill" key={scripture}>{scripture}</span>)}</div></article>
          <article className="daily-inspiration-card"><p className="eyebrow">Daily Inspiration</p><blockquote>The Lord will keep you from all harm; He will watch over your life.</blockquote><strong>Psalm 121:7</strong></article>
          <article className="daily-progress-card"><p className="eyebrow">Daily Progress</p><div className="progress-widget"><div className="progress-ring" aria-label={`${progressPercent} percent complete`}><span>{progressPercent}%</span></div><ul>{progressItems.map((item) => <li key={item.label}>{item.label} <span>{item.complete ? "✓" : "□"}</span></li>)}</ul></div></article>
          <article className="streak-card"><p className="eyebrow">Streak</p><div className="streak-number"><span>🔥</span><strong>12</strong></div><p>Days</p><small>Keep going, Saint!</small></article>
        </section>
        <section className="today-action-grid">
          <div className="word-card"><p className="eyebrow">Teoyube Word of the Day</p><h3 id="dailyWord">{model.dailyWord.word}</h3><p id="dailyMeaning">{model.dailyWord.meaning}</p><button className="secondary" id="prayBtn" onClick={actions.openPrayerFramework}>Pray Framework</button></div>
          <div className="assignment-card"><p className="eyebrow">Daily Divine Assignment</p><ul id="assignmentList">{model.assignmentItems.map((item) => <li key={item}>{item}</li>)}</ul><textarea id="reflectionInput" placeholder={model.journeyMoment?.reflectionPlaceholder || "Record today's reflection for the Book of the Saint"} value={model.reflection} onChange={(event) => actions.changeReflection(event.target.value)}></textarea><button className="primary full" id="completeAssignment" data-daily-journey-action={model.journeyMoment ? "accept" : undefined} onClick={actions.completeAssignment}>{model.journeyMoment?.primaryLabel || "Complete Assignment"}</button></div>
          <FeaturedStories model={model} actions={actions} />
        </section>
      </div>
      <TeoyubeWorldIntegrations model={model} actions={actions} />
    </section>
  );
}
