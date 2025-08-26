// This file contains the mapping from CSV attribute IDs to human-readable values.

const attributeIdToName: { [key: string]: string } = {
    '1': 'difficulty',
    '2': 'subject',
    '3': 'class',
    '4': 'program',
    '5': 'paper',
    '6': 'exam_set',
    '7': 'chapter',
    '8': 'learning_outcome',
    '9': 'topics',
    '10': 'category',
    '11': 'question_types',
    '12': 'modules',
    '13': 'group_type',
    '14': 'board', // Assuming board/school might be another attribute
    '15': 'vertical' // Added Vertical
};

const attributeValueMap: { [key: string]: { [key: string]: string } } = {
    difficulty: {
        '1': 'Easy', '2': 'Medium', '3': 'Hard'
    },
    subject: {
        '4': 'Science', '5': 'Math', '6': 'English', '7': 'General Math', '8': 'Physics', '9': 'Chemistry',
        '10': 'Biology', '11': 'Higher Math', '12': 'Business Entrepreneurship', '13': 'Accounting',
        '14': 'Finance & Banking', '15': 'Economics', '16': 'Civics and Citizenship',
        '17': 'History of Bangladesh & World Civilization', '73': 'GK National', '74': 'GK International',
        '76': 'ICT', '80': 'Bangla', '89': 'BGS', '102': 'Ethics & Governance', '103': 'Geography',
        '104': 'Mental Ability', '105': 'Marketing', '169': 'Social Work', '170': 'Logic'
    },
    class: {
        '18': 'Class 1', '19': 'Class 2', '20': 'Class 3', '21': 'Class 4', '22': 'Class 5', '23': 'Class 6',
        '24': 'Class 7', '25': 'Class 8', '26': 'Class 9 - 10', '167': 'Class 9', '168': 'Class 10',
        '47': 'Class 11 - 12'
    },
    program: {
        '27': 'Classroom Genius Round 2', '48': 'HSC 2022 Model Test', '49': 'SSC 2022 SMS', '50': 'Employability Test',
        '71': '10MS Townhall', '72': 'Medical Dreamers', '75': 'College Admission Course - 2022',
        '79': 'Bank Jobs Question Solve & Model Test', '81': 'SSC 2023 SMP - Science', '82': 'SSC 2023 SMP - EMBS',
        '83': 'University A Unit Admission 2022', '84': 'University B Unit Admission 2022',
        '85': 'University C Unit Admission 2022', '86': 'Engineering Admission 2022', '87': 'Medical Admission 2022',
        '88': 'Online Batch - 2023', '90': 'IDLC Finance Olympiad 2023', '97': 'BUET Question Solve Course',
        '99': 'HSC 2023 শর্ট সিলেবাস ক্র্যাশ কোর্স [বিজ্ঞান বিভাগ]', '100': 'HSC 23 শেষ মুহূর্তের প্রস্তুতি কোর্স [বিজ্ঞান বিভাগ]',
        '101': 'Admission English (Private Batch)', '98': 'HSC 2023 SMP', '106': 'সরকারি চাকরি পরীক্ষা মডেল টেস্ট',
        '119': 'কলেজ এডমিশন কোর্স ২০২৩', '120': 'HSC Grammar Foundation Course', '121': 'HSC 23 One Shot MCQ Course',
        '122': 'HSC 23 Humanities', '123': 'HSC 23 Business Studies', '124': 'Admission 23 A unit',
        '125': 'Admission 23 B unit', '126': 'Admission 23 C unit', '127': 'Admission 23 Medical',
        '128': 'BAT Project', '151': 'HSC 2024 Crash Course', '152': 'HSC 25 Online Batch',
        '154': 'Ghore Boshe English Grammar', '163': 'SSC 2024 শেষ মুহূর্তের প্রস্তুতি কোর্স', '164': 'Exam Batch Medical Admission 23',
        '165': 'HSC 24 SMP', '166': 'Online Batch 24', '171': 'SSC Private Batch', '172': 'HSC 26 Online Batch',
        '173': 'Admission 24 A unit', '174': 'Admission 24 B unit', '175': 'Admission 24 C unit',
        '176': 'Admission 24 Medical', '177': "B Unit সেকেন্ড টাইমার এডমিশন কোর্স (HSC'23)", '178': 'Horlicks Project',
        '179': 'Online Batch 25', '180': 'HSC 25 SMP', '181': 'Rct project', '182': 'Classroom Genius 2025'
    },
    paper: {
        '28': '1st Paper', '29': '2nd Paper'
    },
    exam_set: {
        '30': 'Set 1', '31': 'Set 2', '91': 'Set 3', '92': 'Set 4', '93': 'Set 5', '94': 'Set 6', '95': 'Set 7',
        '96': 'Set 8', '77': 'Weekly Exam', '78': 'Monthly Exam', '116': 'Weekly Exam Set 2',
        '117': 'Weekly Exam Set 3', '118': 'Weekly Exam Set 4', '155': 'Question Bank', '156': 'Set 9',
        '157': 'Set 10', '158': 'Set 11', '159': 'Set 12', '160': 'Set 13', '161': 'Set 14', '162': 'Set 15'
    },
    chapter: {
        '32': 'Chapter 1', '33': 'Chapter 2', '34': 'Chapter 3', '35': 'Chapter 4', '36': 'Chapter 5',
        '37': 'Chapter 6', '38': 'Chapter 7', '39': 'Chapter 8', '40': 'Chapter 9', '41': 'Chapter 10',
        '42': 'Chapter 11', '43': 'Chapter 12', '44': 'Chapter 13', '45': 'Chapter 14', '46': 'Chapter 15'
    },
    learning_outcome: {
        '51': 'Knowledge', '52': 'Understanding', '53': 'Application', '54': 'Aptitude and Attitude'
    },
    topics: {
        '55': 'Spoken English', '56': 'Email Writing', '57': 'Presentation Skills', '58': 'MS Word',
        '59': 'MS Excel', '60': 'MS Powerpoint', '61': 'CV Writing', '62': 'Interview Skills',
        '63': 'Research on Jobs', '64': 'Communication Skills', '65': 'Managerial Skills', '66': 'Analytical Ability'
    },
    category: {
        '67': 'Language & Communication', '68': 'Software Skills', '69': 'Job Searching', '70': 'Professional Grooming'
    },
    question_types: {
        '107': 'MCQ', '108': 'True / False', '109': 'Fill in the Blanks'
    },
    modules: {
        '110': 'listening', '111': 'reading', '112': 'writing', '113': 'speaking'
    },
    group_type: {
        '114': 'main passage', '115': 'child passage'
    },
    vertical: {
        '183': 'K-12',
        '184': 'English'
    }
};


/**
 * Decodes the attributes from a CSV row into a structured object.
 * @param row - A row object from PapaParse.
 * @returns A decoded attributes object.
 */
export function decodeAttributes(row: any): { [key: string]: string | undefined } {
    const decoded: { [key: string]: string | undefined } = {};

    for (let i = 1; i <= 5; i++) {
        const idKey = `attributes_${i}_id`;
        const valueKey = `attributes_${i}_value`;

        if (row[idKey] && row[valueKey]) {
            const attributeName = attributeIdToName[row[idKey]];
            if (attributeName) {
                const valueMap = attributeValueMap[attributeName];
                if (valueMap) {
                    decoded[attributeName] = valueMap[row[valueKey]] || row[valueKey];
                } else {
                    decoded[attributeName] = row[valueKey];
                }
            }
        }
    }
    return decoded;
}
