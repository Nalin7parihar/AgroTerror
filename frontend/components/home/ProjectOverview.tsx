'use client';

import { Card } from '../ui/Card';

export function ProjectOverview() {
  return (
    <section id="project-overview" className="py-20 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
              About <span className="text-primary">AgrIQ</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          
          <Card className="mb-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-lg text-text/80 leading-relaxed mb-6">
                <strong className="text-primary">AgrIQ</strong> is an innovative AI-powered platform 
                that revolutionizes agricultural biotechnology through advanced gene editing techniques. 
                Our mission is to help researchers and scientists design optimal CRISPR edits for 
                climate-resilient crops.
              </p>
              
              <p className="text-lg text-text/80 leading-relaxed mb-6">
                By combining cutting-edge artificial intelligence with CRISPR-Cas9 technology, 
                we enable precise gene modifications that enhance crop resistance to drought, 
                pests, and extreme weather conditions. Our platform provides a comprehensive 
                workflow from trait discovery to edit validation, all powered by multi-omics 
                data integration and digital twin simulations.
              </p>
              
              <div className="bg-secondary/30 rounded-xl p-6 border-l-4 border-primary">
                <p className="text-base text-text/90 leading-relaxed m-0">
                  <strong className="text-primary">Our Vision:</strong> To create a future where 
                  agriculture is sustainable, resilient, and capable of feeding a growing global 
                  population despite climate challenges.
                </p>
              </div>
            </div>
          </Card>
          
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <Card hover className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">AI-Powered</div>
              <p className="text-sm text-text/70">Advanced algorithms for optimal edit design</p>
            </Card>
            <Card hover className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">Precise</div>
              <p className="text-sm text-text/70">CRISPR technology for accurate modifications</p>
            </Card>
            <Card hover className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">Validated</div>
              <p className="text-sm text-text/70">Digital twin simulations before lab work</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

