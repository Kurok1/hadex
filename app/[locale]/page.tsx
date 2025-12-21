/**
 * Copyright 2025 Kurok1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client"
import React from 'react'

import Navbar from '@/app/components/layouts/Navbar'
import Footer from '@/app/components/layouts/Footer';

import { useTranslations } from 'next-intl';

export default function NavigationHome({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = React.use(params)
  const t = useTranslations('MainPage');
  return (
    <div>
      <Navbar />
      <div className="h-[calc(100dvh-8rem)] bg-base-200">
        {/* Hero Section - Full Screen */}
        <div className="hero h-[calc(100dvh-8rem)] text-base-content">
          <div className="hero-content text-center flex flex-col justify-center">
            <div className="max-w-screen-lg">
              {/* Hero Title and Description */}
              <div className="mb-12">
                <h1 className="text-5xl font-bold mb-4">{t('description')}</h1>
                {/* Card Section - Inside Hero */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* NER Card */}
                  <a href={`/${resolvedParams.locale}/ner`} className="card card-compact bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="card-body items-center text-center">
                      <h2 className="card-title text-xl">{t('ner.title')}</h2>
                      <p className="py-2 text-base-content">{t('ner.description')}</p>
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary">{t('start')}</button>
                      </div>
                    </div>
                  </a>

                  {/* Classification Card */}
                  <a href={`/${resolvedParams.locale}/classification`} className="card card-compact bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="card-body items-center text-center">
                      <h2 className="card-title text-xl">{t('classification.title')}</h2>
                      <p className="py-2 text-base-content">{t('classification.description')}</p>
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-neutral" disabled={true} >{t('comingSoon')}</button>
                      </div>
                    </div>
                  </a>
                </div>
                <p className="text-lg max-w-2xl mx-auto mt-8">
                  {t('chooseYourTool')}
                </p>
              </div>


            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>

  )
}