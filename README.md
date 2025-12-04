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

The system consists of four main components: **Frontend**, **Backend**, **Search Engine**, and **AI Service**.

### Frontend (React App)
- Users enter search queries or chat messages in the web interface.
- Sends requests to the backend for search or chat operations.

### Backend (FastAPI)
- Receives search and chat requests from the frontend.
- Strips identifying headers to preserve privacy.
- Routes all search queries to SearXNG via Tor, ensuring user IPs are hidden.
- Sends search results to OpenAI API to generate summaries and chatbot responses.

### Search Engine (SearXNG + Tor)
- SearXNG aggregates results from multiple search engines.
- All outgoing queries are routed through Tor for anonymity.
- Returns raw search results to the backend.

### AI Service (OpenAI GPT-3.5-Turbo)
- Generates concise summaries of search results.
- Provides chatbot responses based only on SearXNG results and recent conversation history (last 10 messages).


