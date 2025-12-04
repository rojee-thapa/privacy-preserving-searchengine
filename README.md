# Privacy-Preserving AI Search Engine

## Abstract

This project presents a privacy-focused, AI-enhanced search engine. It combines a Dockerized SearXNG metasearch engine with Tor routing, FastAPI backend middleware for privacy, and OpenAI-powered AI features. Users can perform web searches, view AI-generated summaries, and interact with a chatbot, all without exposing personal data or being tracked.

## Introduction

The modern web often compromises user privacy. Traditional search engines collect user data for tracking, profiling, and advertising. This project addresses these concerns by creating a secure search platform where:

- All search queries are routed through Tor, anonymizing user IP addresses.
- Headers that could identify users are stripped server-side.
- AI assists in summarizing search results and providing contextual chatbot answers, without storing or exposing personal information.

The system integrates **privacy-preserving search**, **AI-generated summaries**, and **chatbot interaction** to provide a private, informative, and customizable search experience.

---

## Key Features

### Backend Privacy Architecture
- SearXNG deployed inside Docker as the core metasearch engine.
- All outgoing SearXNG search queries are routed through Tor, hiding user IP addresses.
- Header-stripping middleware in FastAPI reduces fingerprinting and server-side tracking.
- Users never interact directly with search providers; the backend handles everything.

### AI-Augmented Features
- OpenAI API is used to summarize SearXNG search results.
- Chatbot uses only SearXNG-generated information for context, preserving privacy.
- Conversation memory: the last 10 messages are used to maintain smooth, contextual interactions.

### Search Interface
- Categories: General, News, Tech, Research.
- User customization:
  - Light/Dark mode
  - Number of search results
  - Adjustable search modules

### No Accounts & No Tracking
- No login required.
- No data collection.
- No cookies or client-side tracking.
- All privacy handled server-side.

### Outcome
A private, customizable, AI-enhanced search engine where users’ identities and activities remain secure.

---

## Architecture Overview

