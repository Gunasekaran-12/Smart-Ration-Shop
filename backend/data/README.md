# Smart Ration Centralized Inventory & Persistent Backup Directory
# Path: backend/data/
# 
# This directory serves as the centralized persistent backup storage for:
# 1. Automated real-time JSON snapshots of commodity inventory and stock batches
# 2. Historical ledger backup archives (JSON / CSV)
# 3. Emergency state restores across application restarts
#
# Primary Database Source of Truth: MySQL schema `smart` (or lightweight SQLite fallback).
#
# Hosting / Deployment Note:
# For cloud deployment platforms (e.g. Railway, Render, Docker, AWS EBS), mount a persistent
# volume to `backend/data` to ensure snapshot data is preserved across container redeployments.

