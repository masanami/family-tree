import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load page components for optimal bundle splitting
const FamilyTreePage = React.lazy(() => 
  import('./pages/FamilyTreePage').then(module => ({
    default: module.FamilyTreePage
  }))
);

const PersonManagementPage = React.lazy(() => 
  import('./pages/PersonManagementPage').then(module => ({
    default: module.PersonManagementPage
  }))
);

const RelationshipManagementPage = React.lazy(() => 
  import('./pages/RelationshipManagementPage').then(module => ({
    default: module.RelationshipManagementPage
  }))
);

// Navigation component
const Navigation = () => (
  <nav className="bg-white shadow-sm border-b">
    <div className="container mx-auto px-4">
      <div className="flex space-x-8">
        <a
          href="/family-tree"
          className="text-gray-600 hover:text-gray-900 px-3 py-4 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
        >
          家系図
        </a>
        <a
          href="/persons"
          className="text-gray-600 hover:text-gray-900 px-3 py-4 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
        >
          人物管理
        </a>
        <a
          href="/relationships"
          className="text-gray-600 hover:text-gray-900 px-3 py-4 text-sm font-medium border-b-2 border-transparent hover:border-gray-300"
        >
          関係性管理
        </a>
      </div>
    </div>
  </nav>
);

// Main App Router with lazy loading and error boundaries
export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/family-tree" replace />} />
              
              <Route 
                path="/family-tree" 
                element={
                  <FamilyTreePage
                    familyTreeData={{ nodes: [], edges: [] }}
                    onPersonClick={() => {}}
                    onPersonEdit={() => {}}
                    onLayoutChange={() => {}}
                  />
                } 
              />
              
              <Route 
                path="/persons" 
                element={
                  <PersonManagementPage
                    persons={[]}
                    onPersonCreate={() => {}}
                    onPersonUpdate={() => {}}
                    onPersonDelete={() => {}}
                  />
                } 
              />
              
              <Route 
                path="/relationships" 
                element={
                  <RelationshipManagementPage
                    persons={[]}
                    relationships={[]}
                    onRelationshipCreate={() => {}}
                    onRelationshipUpdate={() => {}}
                    onRelationshipDelete={() => {}}
                  />
                } 
              />
              
              {/* 404 fallback */}
              <Route 
                path="*" 
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-4">ページが見つかりません</p>
                      <a 
                        href="/family-tree" 
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        ホームに戻る
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
};

AppRouter.displayName = 'AppRouter';