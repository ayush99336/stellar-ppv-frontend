// Quick test script to check if video fetching works
import { getVideoInfo, getVideoCount, hasAccess } from './realContractHelpers.js';

async function testContractFunctions() {
  try {
    console.log('Testing contract functions...');
    
    // Test getting video count
    console.log('Getting video count...');
    const count = await getVideoCount();
    console.log('Video count:', count);
    
    // Test getting video info for video ID 1
    console.log('Getting video info for video ID 1...');
    const video1Info = await getVideoInfo(1n);
    console.log('Video 1 info:', video1Info);
    
    // Test getting video info for video ID 2
    console.log('Getting video info for video ID 2...');
    const video2Info = await getVideoInfo(2n);
    console.log('Video 2 info:', video2Info);
    
    // Test access check
    console.log('Checking access for uploader...');
    const hasAccess1 = await hasAccess('GBRI5HZ32MR3KOXNELGMDZS3253LEMDED6TMRJJQW4727QHABOXOZGZ6', 1n);
    console.log('Uploader has access to video 1:', hasAccess1);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testContractFunctions();
