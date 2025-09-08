import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DisclaimerProps {
  showModal?: boolean;
  onClose?: () => void;
  variant?: 'modal' | 'footer';
}

const Disclaimer: React.FC<DisclaimerProps> = ({ 
  showModal = false, 
  onClose, 
  variant = 'footer' 
}) => {
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('mugPunters_disclaimer_seen');
    setHasSeenDisclaimer(seen === 'true');
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mugPunters_disclaimer_seen', 'true');
    setHasSeenDisclaimer(true);
    if (onClose) onClose();
  };

  const disclaimerContent = (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-amber-600">
        <ExclamationTriangleIcon className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Important Investment Disclaimer</h3>
      </div>
      
      <div className="space-y-3 text-sm text-gray-700">
        <p className="font-medium text-red-600">
          <strong>This is not financial advice.</strong> All information provided by Mug Punters Investment Research Platform is for educational and research purposes only.
        </p>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">Australian Financial Services Disclaimer:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Mug Punters is not a licensed financial services provider under the Corporations Act 2001 (Cth)</li>
            <li>We do not hold an Australian Financial Services Licence (AFSL)</li>
            <li>All analysis, reports, and recommendations are general information only</li>
            <li>No personal financial advice is provided to any individual</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">Investment Risks:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All investments carry risk of loss</li>
            <li>Past performance does not guarantee future results</li>
            <li>Market conditions can change rapidly and unpredictably</li>
            <li>You may lose some or all of your invested capital</li>
            <li>Consider your personal circumstances before investing</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">Your Responsibilities:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Conduct your own research and due diligence</li>
            <li>Seek professional financial advice if needed</li>
            <li>Only invest what you can afford to lose</li>
            <li>Understand the risks associated with each investment</li>
            <li>Consider your investment objectives and risk tolerance</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-blue-800 text-xs">
            <strong>ASIC Consumer Warning:</strong> Before making any investment decision, consider seeking advice from a qualified financial adviser. 
            Visit <a href="https://www.moneysmart.gov.au" target="_blank" rel="noopener noreferrer" className="underline">MoneySmart.gov.au</a> for more information.
          </p>
        </div>

        <p className="text-xs text-gray-600 italic">
          By using this platform, you acknowledge that you have read, understood, and agree to this disclaimer. 
          Last updated: {new Date().toLocaleDateString('en-AU')}
        </p>
      </div>
    </div>
  );

  // Show modal on first visit
  if (variant === 'modal' && showModal && !hasSeenDisclaimer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {disclaimerContent}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Footer disclaimer
  if (variant === 'footer') {
    return (
      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-2">Mug Punters Investment Research Platform</h3>
              <p className="text-xs text-gray-400 mb-3">
                Professional investment research and analysis tools for Australian investors.
              </p>
              <div className="text-xs text-gray-500">
                <p className="mb-1">
                  <strong className="text-red-400">Disclaimer:</strong> This is not financial advice. 
                  All information is for educational purposes only.
                </p>
                <p>
                  Mug Punters is not a licensed financial services provider. 
                  Always seek professional advice before making investment decisions.
                </p>
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-sm font-semibold text-white mb-2">Quick Links</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <a href="https://www.moneysmart.gov.au" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors">
                    ASIC MoneySmart
                  </a>
                </li>
                <li>
                  <a href="https://www.asx.com.au" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors">
                    ASX Official Site
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('#', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('#', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
              <p>&copy; 2024 Mug Punters Investment Research Platform. All rights reserved.</p>
              <p className="mt-2 sm:mt-0">
                Built for Australian investors • Not financial advice • Use at your own risk
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return null;
};

export default Disclaimer;
