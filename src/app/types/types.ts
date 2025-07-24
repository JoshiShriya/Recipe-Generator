"use client";

//import React, { useState, useEffect } from "react"; 
interface ContentPart {
  text: string;
}

export interface Content {
  parts: ContentPart[];
}

export interface Candidate {
  content: Content;
}

export interface GeminiApiResponse {
  candidates?: Candidate[];
  error?: {
    message?: string;
  };
}
export interface InventoryItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  notes?: string;
}

export interface SavedRecipe extends GeneratedRecipe {
  id: string;
  createdAt: string;
}

export type ModalType = 'alert' | 'confirm'| 'success' | 'error' | 'warning' | 'info';

export interface ModalState {
  message: string;
  type: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
  isVisible: boolean;
}
