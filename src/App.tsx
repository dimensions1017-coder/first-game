/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  BookOpen, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Trash2, 
  Trash, 
  RotateCcw,
  RefreshCcw,
  BookMarked, 
  Volume2, 
  VolumeX, 
  Mic2, 
  Filter,
  Brain,
  Trophy,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Mic,
  Search,
  Activity,
  Award,
  Sun,
  Moon,
  Flame,
  Zap,
  Pencil,
  Plus,
  PlusCircle,
  Save,
  Settings,
  MoreVertical,
  Code
} from 'lucide-react';
import { Howl, Howler } from 'howler';

interface SRSProgress {
  interval: number; // days
  ease: number;
  dueDate: number; // timestamp
  streak: number;
}

interface Word {
  en: string;
  cn: string;
  category: string;
  phonetic?: string;
  example?: string;
  relatedTerms?: {
    en: string;
    cn: string;
    example: string;
  }[];
}

const VOCABULARY: Word[] = [
  // 0. 关键字与基础 (Keywords & Headers)
  { 
    en: "include", 
    cn: "包含 (预处理指令)", 
    category: "基础语法", 
    phonetic: "/ɪnˈkluːd/", 
    example: "#include <iostream>",
    relatedTerms: [
      { en: "preprocess", cn: "预处理", example: "#include is handled by preprocessor" },
      { en: "header file", cn: "头文件", example: ".h or .hpp files" }
    ]
  },
  { 
    en: "bits/stdc++.h", 
    cn: "万能头文件 (包含几乎所有标准库)", 
    category: "基础语法", 
    phonetic: "/bɪts stændərd siːpipiː dɒt eɪtʃ/", 
    example: "#include <bits/stdc++.h>",
    relatedTerms: [
      { en: "standard library", cn: "标准库", example: "The collection of classes and functions" },
      { en: "compilation time", cn: "编译时间", example: "Using bits/stdc++.h may increase it" }
    ]
  },
  { 
    en: "iostream", 
    cn: "输入输出流头文件", 
    category: "基础语法", 
    phonetic: "/ˌaɪoʊˈstriːm/", 
    example: "Standard I/O stream library.",
    relatedTerms: [
      { en: "istream", cn: "输入流", example: "Base class for input" },
      { en: "ostream", cn: "输出流", example: "Base class for output" }
    ]
  },
  { en: "iomanip", cn: "控制输出格式头文件", category: "基础语法", phonetic: "/ˌaɪoʊˈmænɪp/", example: "std::setw(10), std::fixed" },
  { en: "fstream", cn: "文件流：用于文件的读写操作 (ifstream/ofstream)", category: "基础语法", phonetic: "/ˈɛf striːm/", example: "std::ofstream out(\"file.txt\"); out << \"Hello\";" },
  { en: "sstream", cn: "字符串流：允许像操作流一样操作字符串", category: "基础语法", phonetic: "/ˈɛs striːm/", example: "std::stringstream ss; ss << 100; string s = ss.str();" },
  { en: "cmath", cn: "数学函数库：提供三角函数、对数、平方根等数学运算", category: "基础语法", phonetic: "/siːˈmæθ/", example: "double res = std::sqrt(16.0); // 4.0" },
  { en: "climits", cn: "基本类型限制：定义了各种变量类型的最大/最小值", category: "基础语法", phonetic: "/siː ˈlɪmɪts/", example: "cout << INT_MAX << endl; // 2147483647" },
  { en: "chrono", cn: "时间库：处理时间间隔、时间点和高精度计时", category: "基础语法", phonetic: "/ˈkroʊnoʊ/", example: "auto start = std::chrono::steady_clock::now();" },
  { en: "cstdlib", cn: "标准工具库：包含随机数、程序退出、动态分配等函数", category: "基础语法", phonetic: "/siː ˈɛstidiː ˈlɪb/", example: "int r = std::rand() % 100; std::exit(0);" },
  { en: "functional", cn: "函数对象/绑定头文件", category: "基础语法", phonetic: "/ˈfʌŋkʃənəl/", example: "std::function, std::bind" },
  { en: "numeric", cn: "数值算法：提供求和、寻找最大公约数等数值处理算法", category: "基础语法", phonetic: "/njuːˈmɛrɪk/", example: "int sum = std::accumulate(v.begin(), v.end(), 0);" },
  { en: "iterator", cn: "迭代器定义头文件", category: "基础语法", phonetic: "/ɪˈtɛreɪtər/", example: "std::back_inserter" },
  { en: "utility", cn: "通用工具(pair/move)头文件", category: "基础语法", phonetic: "/juːˈtɪləti/", example: "std::pair, std::move" },
  { en: "bitset", cn: "二进制位集：一种用于管理二进制位的容器", category: "基础语法", phonetic: "/ˈbɪtsɛt/", example: "std::bitset<8> b(42); cout << b.to_string();" },
  { en: "random", cn: "随机数生成器：比 rand() 更先进、可控性更强的随机数工具", category: "基础语法", phonetic: "/ˈrændəm/", example: "std::mt19937 gen(rd()); std::uniform_int_distribution<> d(1, 6);" },
  { en: "type_traits", cn: "元编程类型特征头文件", category: "基础语法", phonetic: "/taɪp treɪts/", example: "std::is_integral<T>::value" },
  { en: "stdexcept", cn: "标准异常类头文件", category: "基础语法", phonetic: "/ˌɛstidiː ɪkˈsɛpʃn/", example: "std::runtime_error" },
  { en: "filesystem", cn: "文件系统库(C++17)：跨平台操作路径、目录和文件的工具", category: "基础语法", phonetic: "/ˈfaɪlsɪstəm/", example: "if(std::filesystem::exists(\"path\")) { ... }" },
  { en: "regex", cn: "正则表达式头文件", category: "基础语法", phonetic: "/ˈrɛdʒɛks/", example: "std::regex_match" },
  { en: "optional", cn: "可选值容器头文件(C++17)", category: "基础语法", phonetic: "/ˈɒpʃənəl/", example: "std::optional<int> res;" },
  { en: "variant", cn: "类型安全联合体头文件(C++17)", category: "基础语法", phonetic: "/ˈvɛəriənt/", example: "std::variant<int, string> v;" },
  { en: "span", cn: "轻量级连续内存视图(C++20)", category: "基础语法", phonetic: "/spæn/", example: "std::span<int> s(arr);" },
  { en: "ranges", cn: "范围库(C++20)：允许更简洁地将算法链接在一起", category: "基础语法", phonetic: "/ˈreɪndʒɪz/", example: "auto res = v | std::views::filter(even) | std::views::transform(sq);" },
  { en: "memory", cn: "内存管理：提供了 unique_ptr, shared_ptr 等智能指针", category: "基础语法", phonetic: "/ˈmɛməri/", example: "auto p = std::make_unique<int>(10);" },
  { en: "cstdint", cn: "固定宽度整数类型头文件", category: "基础语法", phonetic: "/siː ˈɛstidiː ɪnt/", example: "int32_t, uint64_t" },
  { en: "cctype", cn: "字符处理：判断字符是否为数字、字母或大小写转换", category: "基础语法", phonetic: "/siː ˈsiː taɪp/", example: "if(std::isdigit('5')) { ... }" },
  { en: "cfloat", cn: "浮点数极限头文件", category: "基础语法", phonetic: "/siː ˈfloʊt/", example: "DBL_MAX, FLT_MIN" },
  { en: "cassert", cn: "运行期断言：用于调试，检查程序是否满足特定逻辑条件", category: "基础语法", phonetic: "/siː əˈsɜːrt/", example: "assert(ptr != nullptr); // 若为null则终止程序" },
  { en: "cstddef", cn: "标准定义(nullptr_t)头文件", category: "基础语法", phonetic: "/siː ˈɛstidiː dɛf/", example: "size_t, ptrdiff_t" },
  { en: "future", cn: "异步编程(promise/future)头文件", category: "基础语法", phonetic: "/ˈfjuːtʃər/", example: "std::async, std::promise" },
  { en: "condition_variable", cn: "条件变量头文件", category: "基础语法", phonetic: "/kənˈdɪʃn ˈvɛəriəbl/", example: "std::condition_variable cv;" },
  { en: "array", cn: "静态数组容器头文件", category: "基础语法", phonetic: "/əˈreɪ/", example: "std::array<int, 5> a;" },
  { en: "list", cn: "双向链表容器头文件", category: "基础语法", phonetic: "/lɪst/", example: "std::list<int> L;" },
  { en: "deque", cn: "双端队列容器头文件", category: "基础语法", phonetic: "/ˈdɛk/", example: "std::deque<int> d;" },
  { en: "set", cn: "集合(有序)容器头文件", category: "基础语法", phonetic: "/sɛt/", example: "std::set<string> s;" },
  { en: "map", cn: "映射(有序键值对)头文件", category: "基础语法", phonetic: "/mæp/", example: "std::map<int, string> m;" },
  { en: "unordered_set", cn: "哈希集合(无序)头文件", category: "基础语法", phonetic: "/ʌnˈɔːrdərd sɛt/", example: "std::unordered_set<int> us;" },
  { en: "unordered_map", cn: "哈希映射(无序)头文件", category: "基础语法", phonetic: "/ʌnˈɔːrdərd mæp/", example: "std::unordered_map<K, V> um;" },
  { en: "tuple", cn: "多元组：可存储任意数量、任意类型的固定大小集合", category: "基础语法", phonetic: "/ˈtʌpl/", example: "auto t = std::make_tuple(1, \"ok\", 3.14);" },
  { en: "concepts", cn: "模板约束/概念头文件(C++20)", category: "基础语法", phonetic: "/ˈkɒnsɛpts/", example: "std::integral, std::derived_from" },
  { en: "compare", cn: "三路比较(spaceship)头文件(C++20)", category: "基础语法", phonetic: "/kəmˈpɛər/", example: "operator<=>" },
  { en: "format", cn: "文本格式化(C++20)：类型安全且高效的现代化 printf 替代品", category: "基础语法", phonetic: "/ˈfɔːrmæt/", example: "std::format(\"Hello {}\", name);" },
  { en: "bit", cn: "位操作工具头文件(C++20)", category: "基础语法", phonetic: "/bɪt/", example: "std::has_single_bit, std::popcount" },
  { en: "numbers", cn: "数学常数(C++20)：提供各种常用的数学、物理常数(如 π)", category: "基础语法", phonetic: "/ˈnʌmbərz/", example: "double circle = 2 * std::numbers::pi * radius;" },
  { en: "any", cn: "任意类型容器头文件(C++17)", category: "基础语法", phonetic: "/ˈɛni/", example: "std::any a = 5;" },
  { en: "initializer_list", cn: "大括号初始化列表头文件", category: "基础语法", phonetic: "/ɪˈnɪʃəlaɪzər lɪst/", example: "std::initializer_list<int> L;" },
  { en: "typeinfo", cn: "运行时类型标识(RTTI)头文件", category: "基础语法", phonetic: "/taɪp ɪnˈfoʊ/", example: "typeid(obj).name()" },
  { en: "cstdio", cn: "C风格输入输出头文件", category: "基础语法", phonetic: "/siː ˈɛstidiː ˈaɪoʊ/", example: "printf, scanf" },
  { 
    en: "printf", 
    cn: "格式化输出函数 (C风格)", 
    category: "基础语法", 
    phonetic: "/ˈprɪnt ɛf/", 
    example: "printf(\"%d\\n\", x);",
    relatedTerms: [
      { en: "scanf", cn: "格式化输入", example: "scanf(\"%d\", &x);" },
      { en: "format specifier", cn: "格式说明符", example: "%d, %f, %s, %p" }
    ]
  },
  { 
    en: "int", 
    cn: "整型", 
    category: "数据类型", 
    phonetic: "/ɪnt/", 
    example: "int count = 0;",
    relatedTerms: [
      { en: "long long", cn: "长长整型", example: "64-bit integer" },
      { en: "size_t", cn: "尺寸类型", example: "Unsigned type for sizes" }
    ]
  },
  { en: "long long", cn: "长长整型 (至少64位)", category: "数据类型", phonetic: "/lɔːŋ lɔːŋ/", example: "long long big_num = 1e18;" },
  { en: "float", cn: "单精度浮点型", category: "数据类型", phonetic: "/floʊt/", example: "float price = 9.99f;" },
  { en: "double", cn: "双精度浮点型", category: "数据类型", phonetic: "/ˈdʌbl/", example: "double pi = 3.1415926;" },
  { en: "char", cn: "字符型", category: "数据类型", phonetic: "/tʃɑːr/", example: "char grade = 'A';" },
  { en: "bool", cn: "布尔型", category: "数据类型", phonetic: "/buːl/", example: "bool isActive = true;" },
  { en: "void", cn: "无类型/空", category: "数据类型", phonetic: "/vɔɪd/", example: "void myFunction();" },
  { en: "short", cn: "短整型", category: "数据类型", phonetic: "/ʃɔːrt/", example: "short age = 25;" },
  { en: "long", cn: "长整型", category: "数据类型", phonetic: "/lɔːŋ/", example: "long population = 7000000L;" },
  { en: "signed", cn: "有符号", category: "数据类型", phonetic: "/saɪnd/", example: "signed int x = -5;" },
  { en: "unsigned", cn: "无符号", category: "数据类型", phonetic: "/ˌʌnˈsaɪnd/", example: "unsigned int count = 10;" },
  { en: "if", cn: "如果 (条件语句)", category: "基础语法", phonetic: "/ɪf/", example: "if (condition) { ... }" },
  { en: "else", cn: "否则 (条件语句)", category: "基础语法", phonetic: "/ɛls/", example: "else { ... }" },
  { en: "for", cn: "循环语句", category: "基础语法", phonetic: "/fɔːr/", example: "for (int i=0; i<n; ++i)" },
  { en: "while", cn: "当...时 (循环语句)", category: "基础语法", phonetic: "/waɪl/", example: "while (condition) { ... }" },
  { en: "return", cn: "返回", category: "基础语法", phonetic: "/rɪˈtɜːrn/", example: "return 0;" },
  { en: "using", cn: "使用 (如命名空间)", category: "基础语法", phonetic: "/ˈjuːzɪŋ/", example: "using namespace std;" },
  { en: "main", cn: "主函数", category: "基础语法", phonetic: "/meɪn/", example: "int main() { ... }" },
  { en: "std", cn: "标准命名空间", category: "基础语法", phonetic: "/ˌɛstidiː/", example: "using namespace std;" },
  { en: "cout", cn: "标准输出流", category: "基础语法", phonetic: "/siːˈaʊt/", example: "std::cout << \"Hello\";" },
  { en: "cin", cn: "标准输入流", category: "基础语法", phonetic: "/siːˈɪn/", example: "std::cin >> x;" },
  { en: "endl", cn: "换行并刷新缓冲区", category: "基础语法", phonetic: "/ˌɛndˈlaɪn/", example: "std::cout << std::endl;" },
  { en: "static", cn: "静态的 (修饰符)", category: "基础语法", phonetic: "/ˈstætɪk/", example: "static int count = 0;" },
  { en: "const", cn: "常量/只读", category: "基础语法", phonetic: "/kɒnst/", example: "const double PI = 3.14;" },
  { en: "volatile", cn: "易变的 (防止编译器优化)", category: "基础语法", phonetic: "/ˈvɒlətaɪl/", example: "volatile int flag = 1;" },
  { en: "mutable", cn: "可变的 (允许在const成员函数中修改)", category: "基础语法", phonetic: "/ˈmjuːtəbl/", example: "mutable int cache;" },
  { en: "inline", cn: "内联函数", category: "基础语法", phonetic: "/ˈɪnlaɪn/", example: "inline int min(int a, int b)" },
  { en: "friend", cn: "友元", category: "基础语法", phonetic: "/frɛnd/", example: "friend class MyFriend;" },
  { en: "extern", cn: "外部的 (声明外部变量)", category: "基础语法", phonetic: "/ɪkˈstɜːrn/", example: "extern int globalVar;" },
  { en: "typedef", cn: "类型别名 (C风格)", category: "基础语法", phonetic: "/ˈtaɪpdɛf/", example: "typedef unsigned long long ull;" },
  { en: "ios::sync_with_stdio", cn: "同步开关 (关闭以加速I/O)", category: "基础语法", phonetic: "/ˌaɪoʊˈɛs sɪŋk wɪð ˌɛstidiːˈaɪoʊ/", example: "ios::sync_with_stdio(false);" },
  { en: "cin.tie", cn: "解绑输入输出流 (加速接口)", category: "基础语法", phonetic: "/sɪn taɪ/", example: "cin.tie(NULL);" },

  // 1. 基础语法 (Basic Syntax)
  { en: "scope", cn: "作用域", category: "基础语法", phonetic: "/skoʊp/", example: "{ int local = 10; } // local is out of scope" },
  { en: "namespace", cn: "命名空间", category: "基础语法", phonetic: "/ˈneɪmspeɪs/", example: "namespace MyLib { ... }" },
  { en: "compile", cn: "编译", category: "基础语法", phonetic: "/kəmˈpaɪl/", example: "g++ main.cpp -c" },
  { en: "link", cn: "链接", category: "基础语法", phonetic: "/lɪŋk/", example: "g++ main.o -o myApp" },
  { en: "preprocess", cn: "预处理", category: "基础语法", phonetic: "/ˌpriːˈproʊsɛs/", example: "Evaluating #defines & #includes" },
  { en: "directive", cn: "指令/导向", category: "基础语法", phonetic: "/dɪˈrɛktɪv/", example: "#include, #define, #if" },
  { en: "header guard", cn: "头文件保护", category: "基础语法", phonetic: "/ˈhɛdər ɡɑːrd/", example: "#ifndef HEADER_H ... #endif" },

  // 2. 面向对象 (OOP)
  { 
    en: "class", 
    cn: "类", 
    category: "面向对象OOP", 
    phonetic: "/klæs/", 
    example: "class Animal { ... };",
    relatedTerms: [
      { en: "struct", cn: "结构体", example: "Default public members" },
      { en: "access specifier", cn: "访问修饰符", example: "public, private, protected" }
    ]
  },
  { 
    en: "object", 
    cn: "对象", 
    category: "面向对象OOP", 
    phonetic: "/ˈɒbdʒɪkt/", 
    example: "Animal dog;",
    relatedTerms: [
      { en: "instance", cn: "实例", example: "Synonym for object" },
      { en: "lifetime", cn: "生命周期", example: "Scope of an object" }
    ]
  },
  { en: "encapsulation", cn: "封装", category: "面向对象OOP", phonetic: "/ɪnˌkæpsuˈleɪʃn/", example: "private: int secret;" },
  { 
    en: "inheritance", 
    cn: "继承", 
    category: "面向对象OOP", 
    phonetic: "/ɪnˈhɛrɪtəns/", 
    example: "class Dog : public Animal {};",
    relatedTerms: [
      { en: "base class", cn: "基类", example: "The parent class (Animal)" },
      { en: "derived class", cn: "派生类", example: "The child class (Dog)" }
    ]
  },
  { 
    en: "polymorphism", 
    cn: "多态", 
    category: "面向对象OOP", 
    phonetic: "/ˌpɒliˈmɔːrfɪzəm/", 
    example: "Animal* a = new Dog();",
    relatedTerms: [
      { en: "runtime binding", cn: "运行时绑定", example: "Resolution of virtual calls" },
      { en: "vtable", cn: "虚函数表", example: "Mechanism for polymorphism" }
    ]
  },
  { en: "abstraction", cn: "抽象", category: "面向对象OOP", phonetic: "/æbˈstrækʃn/", example: "Interface with pure virtual methods" },
  { en: "constructor", cn: "构造函数", category: "面向对象OOP", phonetic: "/kənˈstrʌktər/", example: "MyClass() { ... }" },
  { en: "destructor", cn: "析构函数", category: "面向对象OOP", phonetic: "/dɪˈstrʌktər/", example: "~MyClass() { ... }" },
  { en: "member function", cn: "成员函数", category: "面向对象OOP", phonetic: "/ˈmɛmbər ˈfʌŋkʃn/", example: "void obj.print();" },
  { en: "virtual function", cn: "虚函数", category: "面向对象OOP", phonetic: "/ˈvɜːrtʃuəl ˈfʌŋkʃn/", example: "virtual void speak();" },
  { en: "pure virtual", cn: "纯虚函数", category: "面向对象OOP", phonetic: "/pjʊər ˈvɜːrtʃuəl/", example: "virtual void run() = 0;" },
  { en: "abstract class", cn: "抽象类", category: "面向对象OOP", phonetic: "/ˈæbstrækt klæs/", example: "A class with pure virtual funcs" },
  { en: "override", cn: "重写标识符：显式地标明某个函数是为重写父类虚函数而设计的", category: "面向对象OOP", phonetic: "/ˌoʊvərˈraɪd/", example: "void draw() override { ... }" },
  { en: "final", cn: "终结关键字：禁止一个类被继承，或禁止一个虚函数被二次重写", category: "面向对象OOP", phonetic: "/ˈfaɪnl/", example: "class Base final { ... }; // 不可被继承" },
  { en: "this", cn: "this 指针：指向当前对象的常指针，用于在成员函数内部访问自身", category: "面向对象OOP", phonetic: "/ðɪs/", example: "this->x = 10; // 访问本对象的成员" },
  { en: "friend class", cn: "友元类", category: "面向对象OOP", phonetic: "/frɛnd klæs/", example: "friend class Helper;" },
  { en: "initializer list", cn: "初始化列表", category: "面向对象OOP", phonetic: "/ɪˈnɪʃəlaɪzər lɪst/", example: "Box(int h) : height(h) {}" },
  { en: "explicit", cn: "显式的", category: "面向对象OOP", phonetic: "/ɪkˈsplɪsɪt/", example: "explicit MyClass(int x);" },

  // 3. 内存与指针 (Memory & Pointers)
  { 
    en: "pointer", 
    cn: "指针", 
    category: "内存与指针", 
    phonetic: "/ˈpɔɪntər/", 
    example: "int* ptr = &x;",
    relatedTerms: [
      { en: "address", cn: "内存地址", example: "Stored by pointers" },
      { en: "dereference", cn: "解引用", example: "Accessing value via *" }
    ]
  },
  { 
    en: "reference", 
    cn: "引用", 
    category: "内存与指针", 
    phonetic: "/ˈrɛfrəns/", 
    example: "int& ref = x;",
    relatedTerms: [
      { en: "alias", cn: "别名", example: "References are aliases" },
      { en: "const reference", cn: "常量引用", example: "Read-only access" }
    ]
  },
  { en: "dereference", cn: "解引用", category: "内存与指针", phonetic: "/ˌdiːˈrɛfrəns/", example: "*ptr = 10;" },
  { en: "address-of", cn: "取地址", category: "内存与指针", phonetic: "/əˈdrɛs ʌv/", example: "&myVar" },
  { en: "stack", cn: "栈", category: "内存与指针", phonetic: "/stæk/", example: "int a; // Stack allocation" },
  { en: "heap", cn: "堆", category: "内存与指针", phonetic: "/hiːp/", example: "new Animal(); // Heap allocation" },
  { en: "allocation", cn: "分配", category: "内存与指针", phonetic: "/ˌæləˈkeɪʃn/", example: "malloc() or new" },
  { en: "deallocation", cn: "释放", category: "内存与指针", phonetic: "/ˌdiːˌæləˈkeɪʃn/", example: "free() or delete" },
  { en: "memory leak", cn: "内存泄漏", category: "内存与指针", phonetic: "/ˈmɛməri liːk/", example: "new without delete" },
  { en: "nullptr", cn: "空指针", category: "内存与指针", phonetic: "/ˈnʌlˌpɔɪntər/", example: "double* d = nullptr;" },
  { 
    en: "smart pointer", 
    cn: "智能指针", 
    category: "内存与指针", 
    phonetic: "/smɑːrt ˈpɔɪntər/", 
    example: "std::unique_ptr<T>",
    relatedTerms: [
      { en: "RAII", cn: "资源获取即初始化", example: "Management pattern for pointers" },
      { en: "ownership", cn: "所有权", example: "Who deletes the memory" }
    ]
  },
  { en: "unique_ptr", cn: "独占指针", category: "内存与指针", phonetic: "/juˈniːk ˌpiːtiˈɑːr/", example: "auto p = make_unique<int>(5);" },
  { en: "shared_ptr", cn: "共享指针", category: "内存与指针", phonetic: "/ʃɛərd ˌpiːtiˈɑːr/", example: "shared_ptr<Node> n1 = n2;" },
  { en: "weak_ptr", cn: "弱指针", category: "内存与指针", phonetic: "/wiːk ˌpiːtiˈɑːr/", example: "Preventing circular refs" },
  { en: "dangling pointer", cn: "野指针", category: "内存与指针", phonetic: "/ˈdæŋɡlɪŋ ˈpɔɪntər/", example: "Pointing to deleted memory" },

  // 4. 标准库与STL (STL & Strings)
  { en: "standard library", cn: "标准库", category: "标准库STL", phonetic: "/ˈstændərd ˈlaɪbrəri/", example: "#include <algorithm>" },
  { en: "string", cn: "字符串头文件/类", category: "标准库STL", phonetic: "/strɪŋ/", example: "std::string name = \"C++\";" },
  { en: "getline", cn: "读取整行字符串", category: "标准库STL", phonetic: "/ˈɡɛtˌlaɪn/", example: "getline(cin, str);" },
  { en: "vector", cn: "动态数组", category: "标准库STL", phonetic: "/ˈvɛktər/", example: "vector<int> v = {1, 2, 3};" },
  { en: "stack", cn: "栈 (后进先出容器)", category: "标准库STL", phonetic: "/stæk/", example: "stack<int> s; s.push(1);" },
  { en: "queue", cn: "队列 (先进先出容器)", category: "标准库STL", phonetic: "/kjuː/", example: "queue<int> q; q.front();" },
  { en: "priority_queue", cn: "优先队列 (堆)", category: "标准库STL", phonetic: "/praɪˈɔːrəti kjuː/", example: "priority_queue<int> maxHeap;" },
  { en: "deque", cn: "双端队列", category: "标准库STL", phonetic: "/ˈdɛk/", example: "deque<int> d;" },
  { en: "pair", cn: "二元组", category: "标准库STL", phonetic: "/pɛər/", example: "pair<int, string> p = {1, \"A\"};" },
  { en: "tuple", cn: "多元组", category: "标准库STL", phonetic: "/ˈtʌpl/", example: "tuple<int, char, double> t;" },
  { en: "map", cn: "映射 (键值对/红黑树实现)", category: "标准库STL", phonetic: "/mæp/", example: "std::map<string, int> ages;" },
  { en: "set", cn: "集合 (有序/红黑树实现)", category: "标准库STL", phonetic: "/sɛt/", example: "std::set<int> uniqueNums;" },
  { en: "unordered_map", cn: "哈希映射 (哈希表实现)", category: "标准库STL", phonetic: "/ʌnˈɔːrdərd mæp/", example: "Search in O(1) average" },
  { en: "container", cn: "容器", category: "标准库STL", phonetic: "/kənˈteɪnər/", example: "vector, list, map, set..." },
  { 
    en: "vector", 
    cn: "向量/动态数组", 
    category: "标准库STL", 
    phonetic: "/ˈvɛktər/", 
    example: "std::vector<int> v;",
    relatedTerms: [
      { en: "sequence container", cn: "序列容器", example: "vector, deque, list" },
      { en: "capacity", cn: "容量", example: "v.capacity() vs v.size()" }
    ]
  },
  { en: "iterator", cn: "迭代器", category: "标准库STL", phonetic: "/ɪˈtɛreɪtər/", example: "for (auto it = v.begin(); ...)" },
  { 
    en: "algorithm", 
    cn: "算法", 
    category: "标准库STL", 
    phonetic: "/ˈælɡərɪðəm/", 
    example: "std::sort(v.begin(), v.end());",
    relatedTerms: [
      { en: "predicate", cn: "谓词", example: "Condition function like [](int x){return x>0;}" },
      { en: "complexity", cn: "复杂度", example: "Performance (e.g., O(n log n))" }
    ]
  },
  { en: "functor", cn: "仿函数", category: "标准库STL", phonetic: "/ˈfʌŋktər/", example: "struct MyFunc { ... };" },
  { 
    en: "lambda", 
    cn: "Lambda 表达式", 
    category: "标准库STL", 
    phonetic: "/ˈlæmdə/", 
    example: "[](int x) { return x * 2; }",
    relatedTerms: [
      { en: "capture clause", cn: "捕获子句", example: "[&] or [=] at the start" },
      { en: "closure", cn: "闭包", example: "The generated object of a lambda" }
    ]
  },
  { en: "template", cn: "模板", category: "标准库STL", phonetic: "/ˈtɛmplət/", example: "template <typename T>" },
  { en: "Specialization", cn: "特化", category: "标准库STL", phonetic: "/ˌspɛʃələˈzeɪʃn/", example: "template <> class Box<int> { ... }" },
  { en: "cstring", cn: "C风格字符串头文件", category: "标准库STL", phonetic: "/siː ˈɛsˌtrɪŋ/", example: "strlen(), strcpy()" },
  { en: "strlen", cn: "字符串长度 (C风格)", category: "标准库STL", phonetic: "/ˈstrɪŋˌlɛŋθ/", example: "int len = strlen(str);" },
  { en: "abs", cn: "绝对值函数", category: "标准库STL", phonetic: "/æbz/", example: "int x = abs(-5);" },
  { en: "sqrt", cn: "平方根函数", category: "标准库STL", phonetic: "/skwɛər ruːt/", example: "double res = sqrt(16.0);" },
  { en: "sort", cn: "排序算法", category: "标准库STL", phonetic: "/sɔːrt/", example: "std::sort(v.begin(), v.end());" },
  { en: "reverse", cn: "反转算法", category: "标准库STL", phonetic: "/rɪˈvɜːrs/", example: "std::reverse(v.begin(), v.end());" },
  { en: "max_element", cn: "最大值元素算法", category: "标准库STL", phonetic: "/mæks ˈɛlɪmənt/", example: "*std::max_element(v.begin(), v.end());" },
  { en: "lower_bound", cn: "二分查找 (不小于目标的首个位置)", category: "标准库STL", phonetic: "/ˈloʊər baʊnd/", example: "it = std::lower_bound(v.begin(), v.end(), 5);" },
  { en: "upper_bound", cn: "二分查找 (大于目标的首个位置)", category: "标准库STL", phonetic: "/ˈʌpər baʊnd/", example: "it = std::upper_bound(...);" },
  { en: "instantiation", cn: "实例化", category: "标准库STL", phonetic: "/ɪnˌstænʃiˈeɪʃn/", example: "Box<double> myBox;" },
  { en: "string stream", cn: "字符串流", category: "标准库STL", phonetic: "/strɪŋ striːm/", example: "std::stringstream ss;" },

  // 5. 高级特性 (Advanced & Modern)
  { 
    en: "constexpr", 
    cn: "常量表达式", 
    category: "现代特性", 
    phonetic: "/ˌkɒnstˈɛksprə/", 
    example: "constexpr int size = 100;",
    relatedTerms: [
      { en: "consteval", cn: "立即函数", example: "C++20 immediate functions" },
      { en: "compile-time", cn: "编译时", example: "Execution context for constexpr" }
    ]
  },
  { en: "auto type", cn: "自动类型", category: "现代特性", phonetic: "/ˈɔːtoʊ taɪp/", example: "auto x = 5.5; // double" },
  { en: "decltype", cn: "声明类型", category: "现代特性", phonetic: "/ˈdɛkltaɪp/", example: "decltype(x) y; // Same as x" },
  { 
    en: "move semantics", 
    cn: "移动语义", 
    category: "现代特性", 
    phonetic: "/muːv sɪˈmæntɪks/", 
    example: "std::move(heavyObject)",
    relatedTerms: [
      { en: "move constructor", cn: "移动构造函数", example: "T(T&& other)" },
      { en: "std::move", cn: "std::move", example: "Cast to rvalue reference" }
    ]
  },
  { 
    en: "rvalue", 
    cn: "右值", 
    category: "现代特性", 
    phonetic: "/ˈɑːrveɪljuː/", 
    example: "Temporary objects, literals",
    relatedTerms: [
      { en: "rvalue reference", cn: "右值引用", example: "int&& x = 5;" },
      { en: "xvalue", cn: "过期值", example: "Object near end of lifetime" }
    ]
  },
  { en: "lvalue", cn: "左值", category: "现代特性", phonetic: "/ˈɛlveɪljuː/", example: "Variables with a memory address" },
  { en: "exception", cn: "异常", category: "现代特性", phonetic: "/ɪkˈsɛpʃn/", example: "throw std::runtime_error(\"...\")" },
  { en: "try-catch", cn: "异常处理", category: "现代特性", phonetic: "/traɪ kætʃ/", example: "try { ... } catch (...) { ... }" },
  { en: "thread", cn: "线程", category: "现代特性", phonetic: "/θrɛd/", example: "std::thread t1(func);" },
  { en: "mutex", cn: "互斥锁", category: "现代特性", phonetic: "/ˈmjuːtɛks/", example: "std::mutex mtx; lock_guard..." },
  { en: "atomic", cn: "原子操作", category: "现代特性", phonetic: "/əˈtɒmɪk/", example: "std::atomic<int> counter;" },
  { en: "template parameter", cn: "模板参数", category: "现代特性", phonetic: "/ˈtɛmplət pəˈræmɪtər/", example: "<typename T, int N>" },
  { en: "static_cast", cn: "静态强制转换：基本类型之间的转换，或具有继承关系的指针转换", category: "现代特性", phonetic: "/ˈstætɪk kæst/", example: "int a = 10; float f = static_cast<float>(a);" },
  { en: "dynamic_cast", cn: "动态强制转换：主要用于含有虚函数的类体系中的下行转换(运行时检查)", category: "现代特性", phonetic: "/daɪˈnæmɪk kæst/", example: "Dog* d = dynamic_cast<Dog*>(animalPtr);" },
  { en: "reinterpret_cast", cn: "重新解释转换：最危险的转换，直接进行低级的位重解析(如指针转整数)", category: "现代特性", phonetic: "/ˌriːɪnˈtɜːrprɪt kæst/", example: "long addr = reinterpret_cast<long>(ptr);" },
  { en: "const_cast", cn: "常量属性转换：唯一的转换机制用于移除(或添加)变量的 const 属性", category: "现代特性", phonetic: "/ˈkɒnst kæst/", example: "int* p = const_cast<int*>(&immutable_val);" },
  { en: "coroutine", cn: "协程", category: "现代特性", phonetic: "/ˈkoʊruːtiːn/", example: "co_yield, co_return" },

  // 6. C++20 概念 (C++20 Concepts)
  { 
    en: "concept", 
    cn: "概念：谓词形式的编译期谓词，用于约束模板参数", 
    category: "C++20 Concepts", 
    phonetic: "/ˈkɒnsɛpt/",
    example: "template <typename T> concept Integral = std::is_integral_v<T>;",
    relatedTerms: [
      { en: "predicate", cn: "谓词", example: "Compile-time boolean check" },
      { en: "constraint", cn: "约束", example: "Restriction on type properties" }
    ]
  },
  { 
    en: "requires clause", 
    cn: "requires 子句：用于指定模板参数必须满足的约束条件", 
    category: "C++20 Concepts", 
    phonetic: "/rɪˈkwaɪərz klɔːz/",
    example: "template <typename T> requires Integral<T> void foo(T t);"
  },
  { 
    en: "constrained template", 
    cn: "受约束模板：使用概念或 requires 子句限制其通用性的模板", 
    category: "C++20 Concepts", 
    phonetic: "/kənˈstreɪnd ˈtɛmplət/",
    example: "void print(Integral auto val) { std::cout << val; }"
  },

  // 7. 字符串处理 (String Manipulation)
  { 
    en: "substr", 
    cn: "提取子串", 
    category: "字符串处理", 
    phonetic: "/ˈsʌbˌstrɪŋ/", 
    example: "s.substr(pos, len);",
    relatedTerms: [
      { en: "find", cn: "查找子串", example: "s.find(\"target\")" },
      { en: "npos", cn: "未找到标记", example: "string::npos" }
    ]
  },
  { en: "to_string", cn: "将数值转换为字符串", category: "字符串处理", phonetic: "/tuː ˈstrɪŋ/", example: "string s = to_string(42);" },
  { en: "stoi", cn: "字符串转整数 (String to Int)", category: "字符串处理", phonetic: "/ˈɛstioʊˈaɪ/", example: "int n = stoi(\"123\");" },
  { en: "replace", cn: "替换字符串内容", category: "字符串处理", phonetic: "/rɪˈpleɪs/", example: "s.replace(pos, len, \"new\");" },
  { en: "erase", cn: "擦除/删除内容", category: "字符串处理", phonetic: "/ɪˈreɪz/", example: "s.erase(pos, len);" },
  { en: "insert", cn: "插入内容", category: "字符串处理", phonetic: "/ɪnˈsɜːrt/", example: "s.insert(pos, \"text\");" },

  // 8. 数学运算 (Math)
  { 
    en: "pow", 
    cn: "幂运算 (x的y次方)", 
    category: "数学运算", 
    phonetic: "/paʊ/", 
    example: "double res = pow(2, 10);",
    relatedTerms: [
      { en: "sqrt", cn: "平方根", example: "sqrt(16) = 4" },
      { en: "cbrt", cn: "立方根", example: "cbrt(27) = 3" }
    ]
  },
  { en: "ceil", cn: "向上取整", category: "数学运算", phonetic: "/siːl/", example: "ceil(3.1) = 4.0;" },
  { en: "floor", cn: "向下取整", category: "数学运算", phonetic: "/flɔːr/", example: "floor(3.9) = 3.0;" },
  { en: "round", cn: "四舍五入", category: "数学运算", phonetic: "/raʊnd/", example: "round(3.5) = 4.0;" },
  { en: "gcd", cn: "最大公约数 (C++17)", category: "数学运算", phonetic: "/ˌdʒiː siː ˈdiː/", example: "std::gcd(12, 18) = 6;" },
  { en: "lcm", cn: "最小公倍数 (C++17)", category: "数学运算", phonetic: "/ˌɛl siː ˈɛm/", example: "std::lcm(4, 6) = 12;" },
  { en: "fmod", cn: "浮点数取模", category: "数学运算", phonetic: "/ˈɛf ˈmɒd/", example: "fmod(5.3, 2.0) = 1.3;" },

  // 9. 文件与I/O (File I/O)
  { 
    en: "ifstream", 
    cn: "输入文件流 (读取文件)", 
    category: "文件处理", 
    phonetic: "/ˈaɪ ɛf striːm/", 
    example: "std::ifstream fin(\"data.txt\");",
    relatedTerms: [
      { en: "ofstream", cn: "输出文件流", example: "Writing to file" },
      { en: "fstream", cn: "读写文件流", example: "Combined I/O" }
    ]
  },
  { en: "ofstream", cn: "输出文件流 (写入文件)", category: "文件处理", phonetic: "/ˈoʊ ɛf striːm/", example: "std::ofstream fout(\"out.txt\");" },
  { en: "is_open", cn: "检查文件是否成功打开", category: "文件处理", phonetic: "/ɪz ˈoʊpən/", example: "if (file.is_open()) { ... }" },
  { en: "close", cn: "关闭文件流", category: "文件处理", phonetic: "/kloʊz/", example: "file.close();" },
  { en: "getline", cn: "从流中读取整行文本", category: "文件处理", phonetic: "/ˈɡɛtˌlaɪn/", example: "getline(std::cin, line);" },

  // 10. 容器操作 (Container API)
  { 
    en: "push_back", 
    cn: "在容器末尾添加元素", 
    category: "容器操作", 
    phonetic: "/pʊʃ bæk/", 
    example: "v.push_back(10);",
    relatedTerms: [
      { en: "pop_back", cn: "删除末尾元素", example: "v.pop_back()" },
      { en: "emplace_back", cn: "就地构造并添加 (更高效)", example: "v.emplace_back(args)" }
    ]
  },
  { en: "size", cn: "获取容器内元素数量", category: "容器操作", phonetic: "/saɪz/", example: "size_t n = v.size();" },
  { en: "empty", cn: "检查容器是否为空", category: "容器操作", phonetic: "/ˈɛmpti/", example: "if (v.empty()) { ... }" },
  { en: "clear", cn: "清空容器所有元素", category: "容器操作", phonetic: "/klɪər/", example: "v.clear();" },
  { en: "assign", cn: "为容器分配新内容 (替换旧内容)", category: "容器操作", phonetic: "/əˈsaɪn/", example: "v.assign(5, 100);" },
  { en: "resize", cn: "调整容器大小", category: "容器操作", phonetic: "/ˌriːˈsaɪz/", example: "v.resize(10);" },
  { en: "at", cn: "访问指定索引元素 (带越界检查)", category: "容器操作", phonetic: "/æt/", example: "int x = v.at(0);" },
  { en: "front", cn: "访问首个元素", category: "容器操作", phonetic: "/frʌnt/", example: "int f = v.front();" },
  { en: "back", cn: "访问末尾元素", category: "容器操作", phonetic: "/bæk/", example: "int b = v.back();" },
  { en: "begin", cn: "指向首元素的迭代器", category: "容器操作", phonetic: "/bɪˈɡɪn/", example: "auto it = v.begin();" },
  { en: "end", cn: "指向末尾之后位置的迭代器", category: "容器操作", phonetic: "/ɛnd/", example: "auto it = v.end();" },
];

const SOUND_URLS = {
  flip: 'https://assets.mixkit.co/active_storage/sfx/1471/1471-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  favorite: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  fail: 'https://assets.mixkit.co/active_storage/sfx/953/953-preview.mp3'
};

const sounds: Record<string, Howl> = {};

// Helper for string similarity (simplified)
const getSimilarity = (s1: string, s2: string) => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  
  const editDistance = (a: string, b: string) => {
    const costs = [];
    for (let i = 0; i <= a.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (a.charAt(i - 1) !== b.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[b.length] = lastValue;
    }
    return costs[b.length];
  };

  const distance = editDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - distance) / longer.length;
};

// Preload
Object.entries(SOUND_URLS).forEach(([key, url]) => {
  sounds[key] = new Howl({
    src: [url],
    html5: false, // Use Web Audio for better response time
    preload: true,
    volume: key === 'flip' ? 0.05 : (key === 'success' ? 0.4 : 0.2)
  });
});

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [favorites, setFavorites] = useState<Word[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [appMode, setAppMode] = useState<"study" | "quiz" | "spell" | "challenge">("study");
  const [customVocab, setCustomVocab] = useState<Word[]>(() => {
    const saved = localStorage.getItem('cpp-vocab-custom');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const fullVocab = useMemo(() => [...VOCABULARY, ...customVocab], [customVocab]);

  const [searchQuery, setSearchQuery] = useState("");
  const [masteryData, setMasteryData] = useState<Record<string, 'easy' | 'normal' | 'hard'>>(() => {
    const saved = localStorage.getItem('cpp-vocab-mastery');
    return saved ? JSON.parse(saved) : {};
  });
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "normal" | "hard">("all");

  useEffect(() => {
    localStorage.setItem('cpp-vocab-mastery', JSON.stringify(masteryData));
  }, [masteryData]);

  const updateMastery = (level: 'easy' | 'normal' | 'hard') => {
    if (!currentWord) return;
    setMasteryData(prev => ({
      ...prev,
      [currentWord.en]: level
    }));
    playSound('click');
    setNeedsRetry(false);
    handleNext();
  };

  // Non-repeating Shuffle State
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shufflePointer, setShufflePointer] = useState(0);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [spokenText, setSpokenText] = useState("");

  const startPronunciationTest = (target: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别功能，请尝试使用 Chrome 浏览器。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setAccuracyScore(null);
      setSpokenText("");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript.toLowerCase();
      const score = getSimilarity(result, target);
      setSpokenText(result);
      setAccuracyScore(score);
      if (score > 0.8) playSound('success');
      else playSound('fail');
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState<Word | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [quizType, setQuizType] = useState<"en-to-cn" | "cn-to-en">("en-to-cn");

  // Spelling Study State
  const [spellQuestion, setSpellQuestion] = useState<Word | null>(null);
  const [spellInput, setSpellInput] = useState("");
  const [spellFeedback, setSpellFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [spellScore, setSpellScore] = useState(0);
  const [spellTotal, setSpellTotal] = useState(0);
  const [showSpellAnswer, setShowSpellAnswer] = useState(false);
  const [needsRetry, setNeedsRetry] = useState(false);

  // Challenge State
  const [challengeQuestion, setChallengeQuestion] = useState<Word | null>(null);
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
  const [challengeFeedback, setChallengeFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string | null>(null);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeTotal, setChallengeTotal] = useState(0);

  const generateChallengeQuestion = () => {
    // Pool words that have an example containing the term
    const pool = filteredVocab.filter(w => 
      w.example && w.example.toLowerCase().includes(w.en.toLowerCase())
    );
    
    // Fallback block if filtered list has none
    const list = pool.length > 0 ? pool : fullVocab.filter(w => w.example && w.example.toLowerCase().includes(w.en.toLowerCase()));
    if (list.length === 0) return; // Should not happen with current vocab

    const randomWord = list[Math.floor(Math.random() * list.length)];
    
    // Generate options
    const others = fullVocab.filter(w => w.en !== randomWord.en);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.en);
    const allOptions = [...wrongOptions, randomWord.en].sort(() => 0.5 - Math.random());
    
    setChallengeQuestion(randomWord);
    setChallengeOptions(allOptions);
    setChallengeFeedback(null);
    setSelectedChallengeOption(null);
  };

  const handleChallengeAnswer = (option: string) => {
    if (challengeFeedback) return;
    setSelectedChallengeOption(option);
    const isCorrect = option === challengeQuestion?.en;
    
    if (isCorrect) {
      playSound('success');
      setChallengeFeedback("correct");
      setChallengeScore(prev => prev + 1);
      setTimeout(() => {
        generateChallengeQuestion();
      }, 1500);
    } else {
      playSound('fail');
      setChallengeFeedback("incorrect");
      if (challengeQuestion) {
        setMasteryData(prev => ({ ...prev, [challengeQuestion.en]: 'hard' }));
      }
    }
    setChallengeTotal(prev => prev + 1);
  };

  const generateSpellQuestion = () => {
    const list = filteredVocab.length > 0 ? filteredVocab : fullVocab;
    const randomWord = list[Math.floor(Math.random() * list.length)];
    setSpellQuestion(randomWord);
    setSpellInput("");
    setSpellFeedback(null);
    setShowSpellAnswer(false);
  };

  const checkSpell = () => {
    if (!spellQuestion) return;
    const isCorrect = spellInput.trim().toLowerCase() === spellQuestion.en.toLowerCase();
    
    if (isCorrect) {
      playSound('success');
      setSpellFeedback("correct");
      setSpellScore(prev => prev + 1);
      setTimeout(() => {
        setSpellTotal(prev => prev + 1);
        generateSpellQuestion();
      }, 1500);
    } else {
      playSound('fail');
      setSpellFeedback("incorrect");
      setShowSpellAnswer(true);
      // Auto-tag as hard if wrong in spelling
      if (spellQuestion) {
        setMasteryData(prev => ({ ...prev, [spellQuestion.en]: 'hard' }));
      }
    }
  };

  const generateQuizQuestion = () => {
    const list = filteredVocab.length > 0 ? filteredVocab : fullVocab;
    const randomWord = list[Math.floor(Math.random() * list.length)];
    const type = Math.random() > 0.5 ? "en-to-cn" : "cn-to-en";
    
    // Generate 3 wrong options
    const others = fullVocab.filter(w => w.en !== randomWord.en);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const wrongOptions = shuffledOthers.slice(0, 3).map(w => type === "en-to-cn" ? w.cn : w.en);
    
    const correctOption = type === "en-to-cn" ? randomWord.cn : randomWord.en;
    const allOptions = [...wrongOptions, correctOption].sort(() => 0.5 - Math.random());
    
    setQuizQuestion(randomWord);
    setQuizOptions(allOptions);
    setQuizFeedback(null);
    setSelectedQuizOption(null);
    setQuizType(type);
  };

  const handleQuizAnswer = (option: string) => {
    if (quizFeedback) return;
    
    setSelectedQuizOption(option);
    const isCorrect = quizType === "en-to-cn" 
      ? option === quizQuestion?.cn 
      : option === quizQuestion?.en;

    if (isCorrect) {
      playSound('success');
      setQuizFeedback("correct");
      setQuizScore(prev => prev + 1);
      setTimeout(() => {
        generateQuizQuestion();
      }, 1500);
    } else {
      playSound('fail');
      setQuizFeedback("incorrect");
      // Auto-tag as hard if wrong in quiz
      if (quizQuestion) {
        setMasteryData(prev => ({ ...prev, [quizQuestion.en]: 'hard' }));
      }
    }
    setQuizTotal(prev => prev + 1);
  };

  useEffect(() => {
    if (appMode === "quiz") {
      generateQuizQuestion();
    } else if (appMode === "spell") {
      generateSpellQuestion();
    } else if (appMode === "challenge") {
      generateChallengeQuestion();
    }
  }, [appMode, selectedCategory]);

  useEffect(() => {
    localStorage.setItem('cpp-vocab-custom', JSON.stringify(customVocab));
  }, [customVocab]);

  const categories = useMemo(() => {
    return ["全部", "我的收藏", "自定义", ...Array.from(new Set(fullVocab.map(w => w.category)))];
  }, [fullVocab]);

  const filteredVocab = useMemo(() => {
    let list = selectedCategory === "全部" 
      ? fullVocab 
      : selectedCategory === "我的收藏" 
        ? favorites 
        : selectedCategory === "自定义"
          ? customVocab
          : fullVocab.filter(w => w.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(w => 
        w.en.toLowerCase().includes(q) || 
        w.cn.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
      );
    }
    
    // Difficulty Filter Logic
    if (difficultyFilter !== "all") {
      list = list.filter(w => (masteryData[w.en] || 'normal') === difficultyFilter);
    }
    
    return list;
  }, [selectedCategory, favorites, searchQuery, difficultyFilter, masteryData]);

  // Reset when filter or search changes
  useEffect(() => {
    const indices = Array.from({ length: filteredVocab.length }, (_, i) => i);
    
    // Default to shuffle for variety, easy to change if user wants
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    setShuffledIndices(indices);
    setShufflePointer(0);
    setCurrentIndex(indices[0] || 0);
    setHistory([]);
    setIsFlipped(false);
    setAccuracyScore(null);
  }, [selectedCategory, searchQuery, filteredVocab.length, difficultyFilter]);

  const playSound = (type: keyof typeof SOUND_URLS) => {
    if (isMuted) return;
    
    const sound = sounds[type];
    if (sound) {
      sound.stop();
      sound.play();
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Explicit unlock for mobile/iframe browsers
  const unlockAudio = () => {
    if (!audioUnlocked) {
      if (Howler && Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      
      // Play and immediately stop all sounds to prime them
      Object.values(sounds).forEach(s => {
        const id = s.play();
        s.stop(id);
      });
      
      setAudioUnlocked(true);
      playSound('click');
    }
  };

  // Initialize Favorites
  useEffect(() => {
    const saved = localStorage.getItem('cpp-vocab-favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('cpp-vocab-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Unified Theme System
  useEffect(() => {
    const savedTheme = localStorage.getItem('cpp-vocab-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
    
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cpp-vocab-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setIsDarkMode(prev => !prev);
  };

  const currentWord = filteredVocab[currentIndex] || filteredVocab[0];
  const isFavorite = currentWord ? favorites.some(w => w.en === currentWord.en) : false;

  const handleNext = () => {
    playSound('click');
    setIsFlipped(false);
    setAccuracyScore(null);
    if (filteredVocab.length <= 1) return;
    
    let nextPointer = shufflePointer + 1;
    let nextShuffled = shuffledIndices;

    // If we reached the end of the pool, reshuffle
    if (nextPointer >= filteredVocab.length) {
      const indices = Array.from({ length: filteredVocab.length }, (_, i) => i);
      // Ensure the first item of the new shuffle isn't the same as the last item of the old shuffle
      const lastValue = shuffledIndices[shufflePointer];
      
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      // If the first of new is same as last of old, swap it with another if possible
      if (indices.length > 1 && indices[0] === lastValue) {
        [indices[0], indices[1]] = [indices[1], indices[0]];
      }
      
      nextShuffled = indices;
      nextPointer = 0;
      setShuffledIndices(indices);
    }
    
    setShufflePointer(nextPointer);
    setHistory(prev => [...prev, currentIndex]);
    setCurrentIndex(nextShuffled[nextPointer]);
  };

  const handleSequentialNext = () => {
    if (filteredVocab.length <= 1) return;
    playSound('click');
    setIsFlipped(false);
    setAccuracyScore(null);
    setHistory(prev => [...prev, currentIndex]);
    setCurrentIndex((currentIndex + 1) % filteredVocab.length);
  };

  const handlePrev = () => {
    if (history.length > 0) {
      playSound('click');
      setIsFlipped(false);
      setAccuracyScore(null);
      const lastIndex = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentIndex(lastIndex);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('favorite');
    if (isFavorite) {
      setFavorites(prev => prev.filter(w => w.en !== currentWord.en));
    } else {
      setFavorites(prev => [...prev, currentWord]);
    }
  };

  const toggleFlip = () => {
    playSound('flip');
    setIsFlipped(!isFlipped);
  };

  const removeFavorite = (wordEn: string) => {
    playSound('click');
    setFavorites(prev => prev.filter(w => w.en !== wordEn));
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center p-6 sm:p-12 overflow-hidden relative transition-colors duration-500 bg-natural-bg text-natural-text ${isDarkMode ? 'dark' : ''}`}
      onClick={unlockAudio}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 bg-natural-bg" />

      {/* Audio Unlock Hint */}
      {!audioUnlocked && !isMuted && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-olive text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 pointer-events-none"
        >
          <Volume2 className="h-3 w-3 animate-pulse" />
          点击任意处启用音效
        </motion.div>
      )}

      {/* Header */}
      <header className="w-full max-w-4xl mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-4 ring-olive/10">
              C
            </div>
            <h1 className="text-2xl font-bold text-olive tracking-tight">
              C++ VocabLeaf
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-card-front/30 backdrop-blur-sm p-1.5 rounded-full border border-olive/10">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-olive hover:bg-olive hover:text-white transition-all active:scale-95"
              title={isDarkMode ? "电量不足？切回亮色" : "护眼模式"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full text-olive hover:bg-olive hover:text-white transition-all active:scale-95"
              title={isMuted ? "开启音效" : "静音"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <div className="w-[1px] h-4 bg-olive/20 mx-1" />

            <button 
              onClick={() => { playSound('click'); setIsCustomModalOpen(true); }}
              className="p-2 rounded-full text-olive hover:bg-olive hover:text-white transition-all active:scale-95"
              title="管理自定义词库"
            >
              <PlusCircle className="h-5 w-5" />
            </button>

            <button 
              onClick={() => { playSound('click'); setIsModalOpen(true); }}
              className="px-4 py-1.5 bg-olive text-white rounded-full text-sm font-bold hover:bg-olive-dark transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <BookMarked className="h-4 w-4" />
              <span className="hidden xs:inline">生词本</span>
              {favorites.length > 0 && (
                <span className="bg-white text-olive px-1.5 py-0.5 rounded-full text-[10px] items-center justify-center font-black">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          {/* Search Bar */}
          <div className="relative flex items-center w-full lg:max-w-md group">
            <Search 
              className={`absolute left-4 h-4 w-4 transition-colors ${searchQuery ? 'text-olive font-bold' : 'text-olive/30'}`} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索术语、定义、示例代码..."
              className="w-full pl-11 pr-11 py-3 border-2 border-olive/10 text-olive rounded-2xl bg-card-front/50 backdrop-blur-sm font-medium focus:border-olive/30 focus:bg-card-front shadow-sm transition-all placeholder:text-olive/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 p-1 hover:bg-red-500/10 rounded-full transition-colors text-olive/30 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
            {/* Mode Toggle */}
            <div className="flex bg-card-front/50 backdrop-blur-sm p-1 rounded-2xl border-2 border-olive/5 shadow-sm">
              <button
                onClick={() => { playSound('click'); setAppMode("study"); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${appMode === "study" ? "bg-olive text-white shadow-md" : "text-olive/60 dark:text-olive/80 hover:text-olive"}`}
              >
                <BookOpen className="h-4 w-4" />
                <span>学习</span>
              </button>
              <button
                onClick={() => { playSound('click'); setAppMode("spell"); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${appMode === "spell" ? "bg-olive text-white shadow-md" : "text-olive/60 dark:text-olive/80 hover:text-olive"}`}
              >
                <Mic2 className="h-4 w-4" />
                <span>拼写</span>
              </button>
              <button
                onClick={() => { playSound('click'); setAppMode("quiz"); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${appMode === "quiz" ? "bg-olive text-white shadow-md" : "text-olive/60 dark:text-olive/80 hover:text-olive"}`}
              >
                <Brain className="h-4 w-4" />
                <span>测试</span>
              </button>
              <button
                onClick={() => { playSound('click'); setAppMode("challenge"); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${appMode === "challenge" ? "bg-olive text-white shadow-md" : "text-olive/60 dark:text-olive/80 hover:text-olive"}`}
              >
                <Zap className="h-4 w-4" />
                <span>挑战</span>
              </button>
            </div>

            {appMode === "study" && (
              <div className="flex bg-card-front/50 backdrop-blur-sm p-1 rounded-2xl border-2 border-olive/5 shadow-sm">
                <button
                  onClick={() => { playSound('click'); setDifficultyFilter("all"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${difficultyFilter === "all" ? "bg-olive text-white shadow-sm" : "text-olive/60 dark:text-olive/80 hover:text-olive"}`}
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>全部模式</span>
                </button>
                <button
                  onClick={() => { playSound('click'); setDifficultyFilter("hard"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${difficultyFilter === "hard" ? "bg-red-500 text-white shadow-sm" : "text-red-600/60 hover:text-red-600"}`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>困难模式</span>
                </button>
                <button
                  onClick={() => { playSound('click'); setDifficultyFilter("easy"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${difficultyFilter === "easy" ? "bg-green-500 text-white shadow-sm" : "text-green-600/60 hover:text-green-600"}`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>简单模式</span>
                </button>
              </div>
            )}

            <div className="relative flex items-center group min-w-[140px]">
              <Filter className="absolute left-3.5 h-3.5 w-3.5 text-olive/50" />
              <select
                value={selectedCategory}
                onChange={(e) => { playSound('click'); setSelectedCategory(e.target.value); }}
                className="w-full pl-9 pr-9 py-2.5 border-2 border-olive/10 text-olive rounded-2xl bg-card-front/50 backdrop-blur-sm font-bold text-xs focus:border-olive focus:outline-none transition-all appearance-none cursor-pointer hover:border-olive/30 shadow-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3.5 pointer-events-none text-olive/30 group-hover:text-olive">
                <ChevronLeft className="h-3.5 w-3.5 rotate-[270deg]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <AnimatePresence mode="wait">
          {filteredVocab.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card-front/60 backdrop-blur-md rounded-[32px] p-12 border-2 border-dashed border-olive/20 flex flex-col items-center text-center shadow-inner"
            >
              <div className="w-16 h-16 bg-olive/5 rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-olive/20" />
              </div>
              <h3 className="text-xl font-bold text-olive">
                {difficultyFilter !== "all" ? `${difficultyFilter === "hard" ? "困难模式" : "该难度"}下暂时没有单词` : "没有找到匹配的结果"}
              </h3>
              <p className="text-sm text-olive/50 mt-2 mb-8 leading-relaxed">
                {difficultyFilter !== "all" 
                  ? "太棒了！或者你还没有将任何单词标记为这个难度。切换到全部模式来标记一些单词吧。" 
                  : searchQuery ? `未能找到包含 "${searchQuery}" 的单词。请尝试更换关键词。` : "当前条件下没有可显示的单词。"
                }
              </p>
              <button
                onClick={() => { playSound('click'); setSearchQuery(""); setSelectedCategory("全部"); setDifficultyFilter("all"); }}
                className="bg-olive text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-olive-dark transition-all active:scale-95 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                切换到全部模式
              </button>
            </motion.div>
          ) : appMode === "study" ? (
            <motion.div 
              key="study"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg flex flex-col items-center"
            >
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/2] perspective-1000 mb-12">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50, scale: 0.9, rotateY: 0 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      rotateY: isFlipped ? 180 : 0
                    }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{ 
                      rotateY: { type: "spring", stiffness: 260, damping: 20 },
                      default: { duration: 0.4, ease: "easeOut" }
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full h-full cursor-pointer"
                    onClick={toggleFlip}
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 backface-hidden bg-card-front rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-card-border flex flex-col p-8 sm:p-10 items-center justify-center text-center overflow-hidden">
                      <div className="absolute top-6 right-6">
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={toggleFavorite}
                          className={`text-3xl transition-colors duration-300 ${isFavorite ? 'text-heart-active' : 'text-[#d1d1cf] hover:text-heart-active/50'}`}
                        >
                          &hearts;
                        </motion.button>
                      </div>
                      
                      <span className="text-sm uppercase tracking-widest text-[#a1a196] mb-2 font-bold">
                        {currentWord?.category}
                      </span>

                      <div className="flex flex-col items-center mb-4">
                        <h2 className="text-5xl font-bold text-olive break-words max-w-full leading-tight">
                          {currentWord?.en}
                        </h2>
                        {currentWord?.phonetic && (
                          <span className="text-accent-gold font-serif mt-2 italic">
                            {currentWord.phonetic}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(currentWord?.en || "");
                          }}
                          className="p-3 bg-olive/10 text-olive rounded-full flex items-center gap-2 hover:bg-olive/20 transition-colors"
                          title="播放读音"
                        >
                          <Mic2 className="h-5 w-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">Speak</span>
                        </motion.button>

                        <motion.button
                          whileHover={!isListening ? { scale: 1.1 } : {}}
                          animate={isListening ? { scale: [1, 1.1, 1], transition: { repeat: Infinity } } : {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            startPronunciationTest(currentWord?.en || "");
                          }}
                          className={`p-3 rounded-full flex items-center gap-2 transition-colors ${isListening ? 'bg-heart-active text-white' : 'bg-accent-gold/10 dark:bg-accent-gold/5 text-accent-gold hover:bg-accent-gold/20'}`}
                          title="练习发音"
                        >
                          {isListening ? <Activity className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                          <span className="text-xs font-bold uppercase tracking-widest">{isListening ? "Listening..." : "Practice"}</span>
                        </motion.button>
                      </div>

                      {/* Accuracy Feedback */}
                      <AnimatePresence>
                        {accuracyScore !== null && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mt-4 px-4 py-2 rounded-xl flex flex-col items-center gap-1 ${accuracyScore > 0.8 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}
                          >
                            <div className="flex items-center gap-2 font-bold text-sm">
                              {accuracyScore > 0.8 ? <Award className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                              <span>准确度: {Math.round(accuracyScore * 100)}%</span>
                            </div>
                            <span className="text-[10px] opacity-70">听到: "{spokenText}"</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <p className="mt-6 text-[#a1a196] italic text-sm group-hover:text-olive transition-colors">
                        (点击翻转查看)
                      </p>
                    </div>

                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 backface-hidden bg-card-back rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-card-border flex flex-col p-6 sm:p-10 items-center text-center"
                      style={{ transform: "rotateY(180deg)" }}
                    >
                      <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center py-2 px-1">
                        {needsRetry ? (
                          <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                             <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <XCircle className="h-10 w-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                               <h3 className="text-2xl font-bold text-red-600">记错了？没关系</h3>
                               <p className="text-olive/60">正确答案是：<span className="font-bold text-olive">{currentWord?.cn}</span></p>
                            </div>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setIsFlipped(false);
                                setNeedsRetry(false);
                                playSound('click');
                              }}
                              className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all flex items-center gap-2 active:scale-95"
                            >
                              <RotateCcw className="h-4 w-4" />
                              重新尝试这张卡片
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm uppercase tracking-widest text-[#a1a196] mb-4 font-bold">
                              MEANING
                            </span>
                            
                            <h3 className="text-xl text-accent-gold mb-3 font-medium underline decoration-accent-gold/30 underline-offset-4">
                              {currentWord?.en}
                            </h3>
                            
                            <p className="text-3xl font-bold text-olive leading-relaxed mb-6">
                              {currentWord?.cn}
                            </p>
                            
                            {currentWord?.example && (
                              <div className="mt-4 p-4 bg-olive/5 rounded-xl border border-olive/10 w-full text-left">
                                <span className="text-[10px] uppercase tracking-widest text-[#a1a196] block mb-2 font-bold">EXAMPLE</span>
                                <code className="text-xs font-mono text-olive/80 leading-relaxed break-all">
                                  {currentWord.example}
                                </code>
                              </div>
                            )}

                            {currentWord?.relatedTerms && currentWord.relatedTerms.length > 0 && (
                              <div className="mt-6 w-full text-left space-y-3">
                                <span className="text-[10px] uppercase tracking-widest text-[#a1a196] block font-bold px-1">RELATED TERMS</span>
                                <div className="grid grid-cols-1 gap-2">
                                  {currentWord.relatedTerms.map((term, idx) => (
                                    <div key={idx} className="p-3 bg-accent-gold/5 rounded-xl border border-accent-gold/10">
                                      <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-bold text-olive text-sm uppercase tracking-tight">{term.en}</span>
                                        <span className="text-xs text-accent-gold italic">{term.cn}</span>
                                      </div>
                                      <p className="text-[10px] text-olive/60 leading-tight italic">"{term.example}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {!needsRetry && (
                        <div className="mt-auto pt-4 sm:pt-6 border-t border-[#e0dfd5]/50 w-full flex flex-col gap-3">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#a1a196] font-bold px-1">
                            <span>标记该词难度：</span>
                            {masteryData[currentWord?.en || ''] && (
                              <span className={`px-2 py-0.5 rounded-full text-white ${masteryData[currentWord?.en || ''] === 'easy' ? 'bg-green-500' : masteryData[currentWord?.en || ''] === 'hard' ? 'bg-red-500' : 'bg-olive'}`}>
                                {masteryData[currentWord?.en || ''] === 'easy' ? '简单' : masteryData[currentWord?.en || ''] === 'hard' ? '困难' : '一般'}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateMastery('hard'); }}
                              className="py-2 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-red-500/20 active:scale-95"
                            >
                              困难
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateMastery('normal'); }}
                              className="py-2 bg-olive/10 hover:bg-olive text-olive hover:text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-olive/20 active:scale-95"
                            >
                              一般
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateMastery('easy'); }}
                              className="py-2 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-green-500/20 active:scale-95"
                            >
                              简单
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  disabled={history.length === 0}
                  className="w-14 h-14 rounded-full border-2 border-olive text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-all disabled:opacity-20 shadow-sm"
                  title="回退历史"
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  onClick={handleNext}
                  className="bg-olive text-white px-12 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-olive-dark transition-all flex items-center gap-3"
                >
                  <span>
                    {difficultyFilter !== "all" ? "下一张" : "随机切换"}
                  </span>
                  {difficultyFilter === "all" ? <Shuffle className="h-5 w-5 font-bold" /> : <ChevronRight className="h-5 w-5 font-bold" />}
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSequentialNext}
                  className="w-14 h-14 rounded-full border-2 border-olive text-olive flex items-center justify-center hover:bg-olive hover:text-white transition-all shadow-sm"
                  title="顺序学习 (练习模式)"
                >
                  <RefreshCcw className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="mt-8 text-olive/60 font-medium tracking-widest text-xs flex items-center gap-4">
                <span className="w-12 h-[1px] bg-olive/20" />
                <span>CARD {filteredVocab.length > 0 ? currentIndex + 1 : 0} / {filteredVocab.length}</span>
                <span className="w-12 h-[1px] bg-olive/20" />
              </div>
            </motion.div>
          ) : appMode === "quiz" ? (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Quiz Header Info */}
              <div className="w-full flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2 text-olive font-bold">
                  <Trophy className="h-5 w-5 text-accent-gold" />
                  <motion.span 
                    key={quizScore}
                    initial={{ scale: 1.2, color: '#c5a059' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    正确率: {quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0}% ({quizScore}/{quizTotal})
                  </motion.span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#a1a196] bg-card-front/50 px-3 py-1 rounded-full border border-card-border">
                  当前分类: {selectedCategory}
                </div>
              </div>

              {/* Question Card */}
              <div className="w-full bg-card-front rounded-[32px] p-10 shadow-xl border border-card-border mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-card-back" />
                
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs uppercase tracking-widest text-[#a1a196] mb-4 font-bold">
                    {quizType === "en-to-cn" ? "请选择正确的中文翻译" : "请选择正确的英文术语"}
                  </span>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-bold text-olive">
                      {quizType === "en-to-cn" ? quizQuestion?.en : quizQuestion?.cn}
                    </h2>
                    {quizType === "en-to-cn" && (
                      <button 
                        onClick={() => speak(quizQuestion?.en || "")}
                        className="p-2 bg-olive/5 text-olive rounded-full hover:bg-olive/10 transition-colors"
                      >
                        <Mic2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {quizType === "en-to-cn" && quizQuestion?.phonetic && (
                    <span className="text-accent-gold italic font-serif opacity-70">
                      {quizQuestion.phonetic}
                    </span>
                  )}
                </div>

                {/* Options Grid */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizOptions.map((option, idx) => {
                    const isSelected = selectedQuizOption === option;
                    const isCorrect = quizType === "en-to-cn" 
                      ? option === quizQuestion?.cn 
                      : option === quizQuestion?.en;
                    
                    let bgClass = "bg-card-front border-card-border text-olive hover:border-olive/50 hover:bg-natural-bg/50";
                    if (quizFeedback && isCorrect) bgClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                    if (quizFeedback && isSelected && !isCorrect) bgClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!quizFeedback ? { scale: 1.02 } : {}}
                        whileTap={!quizFeedback ? { scale: 0.98 } : {}}
                        onClick={() => handleQuizAnswer(option)}
                        disabled={!!quizFeedback}
                        className={`p-5 rounded-2xl border-2 transition-all text-lg font-medium flex items-center justify-between group ${bgClass}`}
                      >
                        <span className="flex-1 text-left">{option}</span>
                        {quizFeedback && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {quizFeedback && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Failure/Retry UI */}
              {quizFeedback === "incorrect" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-col items-center gap-4 bg-white dark:bg-card-front p-6 rounded-3xl border-2 border-red-500/20 shadow-xl"
                >
                  <div className="text-center">
                    <p className="text-red-500 font-bold text-lg">答错了！</p>
                    <p className="text-olive/60 text-sm">正确答案：<span className="text-olive font-bold underline decoration-accent-gold underline-offset-4">{quizType === "en-to-cn" ? quizQuestion?.cn : quizQuestion?.en}</span></p>
                  </div>
                  <button 
                    onClick={() => { playSound('click'); setQuizFeedback(null); setSelectedQuizOption(null); }}
                    className="bg-accent-gold text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-gold-dark transition-all active:scale-95 shadow-md"
                  >
                    <RotateCcw className="h-4 w-4" />
                    再试一次
                  </button>
                </motion.div>
              )}

              {/* Reset Score */}
              <button
                onClick={() => { playSound('click'); setQuizScore(0); setQuizTotal(0); generateQuizQuestion(); }}
                className="text-xs font-bold uppercase tracking-widest text-[#a1a196] hover:text-olive transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                重置测试数据
              </button>
            </motion.div>
          ) : appMode === "challenge" ? (
            <motion.div 
              key="challenge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Challenge Header */}
              <div className="w-full flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2 text-olive font-bold">
                  <Zap className="h-5 w-5 text-accent-gold" />
                  <motion.span 
                    key={challengeScore}
                    initial={{ scale: 1.2, color: '#c5a059' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    挑战积分: {challengeScore} | 总次数: {challengeTotal}
                  </motion.span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#a1a196] bg-card-front/50 px-3 py-1 rounded-full border border-card-border">
                  代码填空
                </div>
              </div>

              {/* Challenge Card */}
              <div className="w-full bg-card-front rounded-[32px] p-8 sm:p-10 shadow-xl border border-card-border mb-8 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold" />
                <span className="text-xs uppercase tracking-widest text-[#a1a196] mb-6 font-bold">修复缺损的代码片段</span>
                
                {challengeQuestion && (
                  <div className="w-full bg-natural-bg/50 dark:bg-black/20 p-6 rounded-2xl border border-olive/10 font-mono text-sm sm:text-base leading-relaxed overflow-x-auto whitespace-pre">
                    <div className="text-olive/90">
                      {challengeQuestion.example?.split(new RegExp(`(${challengeQuestion.en})`, 'gi')).map((part, i) => {
                        if (part.toLowerCase() === challengeQuestion.en.toLowerCase()) {
                          return (
                            <span 
                              key={i} 
                              className={`inline-block px-4 py-0.5 rounded-md mx-1 border-b-2 font-bold min-w-[80px] text-center transition-all
                                ${challengeFeedback === 'correct' ? 'bg-green-500/10 border-green-500 text-green-600' : 'bg-accent-gold/10 border-accent-gold text-accent-gold'}
                              `}
                            >
                              {challengeFeedback === 'correct' ? challengeQuestion.en : '____?____'}
                            </span>
                          );
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-center">
                   <p className="text-sm text-olive/60 italic">提示：{challengeQuestion?.cn}</p>
                </div>

                {/* Options Grid */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {challengeOptions.map((option, idx) => {
                    const isSelected = selectedChallengeOption === option;
                    const isCorrect = option === challengeQuestion?.en;
                    
                    let bgClass = "bg-card-front border-card-border text-olive hover:border-olive/50 hover:bg-natural-bg/50";
                    if (challengeFeedback && isCorrect) bgClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                    if (challengeFeedback && isSelected && !isCorrect) bgClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!challengeFeedback ? { scale: 1.02 } : {}}
                        whileTap={!challengeFeedback ? { scale: 0.98 } : {}}
                        onClick={() => handleChallengeAnswer(option)}
                        disabled={!!challengeFeedback}
                        className={`p-4 rounded-xl border-2 transition-all text-sm sm:text-base font-mono font-bold flex items-center justify-between gap-2 ${bgClass}`}
                      >
                        <Code className="h-4 w-4 opacity-30 shrink-0" />
                        <span className="flex-1 text-center">{option}</span>
                        {challengeFeedback && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {challengeFeedback && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Challenge Failure/Retry UI */}
              {challengeFeedback === "incorrect" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-col items-center gap-4 bg-white/50 dark:bg-card-front p-6 rounded-3xl border-2 border-red-500/20 shadow-lg w-full max-w-2xl"
                >
                  <div className="text-center">
                    <p className="text-red-500 font-bold text-lg">识别错误！代码无法运行</p>
                    <p className="text-olive/60 text-sm">再仔细观察一下代码逻辑和语法提示...</p>
                  </div>
                  <button 
                    onClick={() => { playSound('click'); setChallengeFeedback(null); setSelectedChallengeOption(null); }}
                    className="bg-accent-gold text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-gold-dark transition-all active:scale-95 shadow-md w-full sm:w-auto justify-center"
                  >
                    <RotateCcw className="h-4 w-4" />
                    重新尝试这一关
                  </button>
                </motion.div>
              )}

              {/* Reset Score */}
              <button
                onClick={() => { playSound('click'); setChallengeScore(0); setChallengeTotal(0); generateChallengeQuestion(); }}
                className="mt-8 text-xs font-bold uppercase tracking-widest text-[#a1a196] hover:text-olive transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                重置挑战进度
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="spell"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Spell Header Info */}
              <div className="w-full flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2 text-olive font-bold">
                  <GraduationCap className="h-5 w-5 text-accent-gold" />
                  <motion.span 
                    key={spellScore}
                    initial={{ scale: 1.2, color: '#c5a059' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    掌握进度: {spellScore} | 练习总数: {spellTotal}
                  </motion.span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#a1a196] bg-card-front/50 px-3 py-1 rounded-full border border-card-border">
                  拼写练习 ({selectedCategory})
                </div>
              </div>

              {/* Spell Card */}
              <div className="w-full bg-card-front rounded-[32px] p-10 shadow-xl border border-card-border mb-8 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold" />
                
                <span className="text-xs uppercase tracking-widest text-[#a1a196] mb-4 font-bold">请根据含义拼写英文单词</span>
                
                <h2 className="text-4xl font-bold text-olive mb-4 text-center">
                  {spellQuestion?.cn}
                </h2>

                {spellQuestion?.example && (
                  <div className="w-full bg-olive/5 p-4 rounded-xl mb-8 border border-olive/10">
                    <span className="text-[10px] font-bold text-[#a1a196] block mb-2 tracking-widest">CONTEXT</span>
                    <p className="text-sm text-olive/70 italic font-serif">
                      {spellQuestion.example.replace(new RegExp(spellQuestion.en, 'gi'), '_____')}
                    </p>
                  </div>
                )}

                <div className="w-full relative max-w-md">
                  <input
                    type="text"
                    value={spellInput}
                    onChange={(e) => setSpellInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkSpell()}
                    placeholder="在这里输入单词..."
                    autoFocus
                    className={`w-full px-6 py-4 rounded-2xl border-4 text-2xl font-bold text-center transition-all focus:outline-none shadow-inner
                      ${spellFeedback === "correct" 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : spellFeedback === "incorrect"
                          ? "border-red-500 bg-red-50 text-red-700 animate-shake"
                          : "border-olive/20 bg-card-front text-olive focus:border-olive"
                      }
                    `}
                  />
                  {spellFeedback === "correct" && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-12 top-1/2 -translate-y-1/2 text-green-500"
                    >
                      <CheckCircle2 className="h-8 w-8" />
                    </motion.div>
                  )}
                </div>

                {showSpellAnswer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-accent-gold/10 rounded-xl border border-accent-gold/20 flex flex-col items-center"
                  >
                    <span className="text-[10px] font-bold text-accent-gold tracking-widest mb-1">ANSWER</span>
                    <span className="text-xl font-mono font-bold text-accent-gold uppercase tracking-widest">
                      {spellQuestion?.en}
                    </span>
                  </motion.div>
                )}

                <div className="flex gap-4 mt-8 w-full max-w-md">
                  {spellFeedback === "incorrect" ? (
                    <button 
                      onClick={() => { playSound('click'); setSpellFeedback(null); setSpellInput(""); setShowSpellAnswer(false); }}
                      className="w-full py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 animate-bounce-short"
                    >
                      <RotateCcw className="h-4 w-4" />
                      再试一次
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => { playSound('click'); setShowSpellAnswer(true); }}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-accent-gold text-accent-gold font-bold hover:bg-accent-gold/5 transition-all active:scale-95 text-sm"
                      >
                        帮助提示
                      </button>
                      <button 
                        onClick={checkSpell}
                        disabled={spellFeedback === "correct"}
                        className="flex-[2] bg-olive text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                      >
                        检查
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-8 items-center text-xs font-bold text-olive/40 tracking-widest">
                 <button onClick={generateSpellQuestion} className="hover:text-olive transition-colors underline underline-offset-4 tracking-normal font-medium">跳过</button>
                 <span className="w-1 h-1 bg-olive/20 rounded-full" />
                 <span>TIP: 按回车键 (Enter) 快速检查</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notebook Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#2d2d2a]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-natural-bg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-olive/20"
            >
              <div className="p-8 border-b border-card-back flex items-center justify-between bg-natural-bg/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-olive text-white rounded-xl shadow-inner">
                    <BookMarked className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-olive">我的收藏笔记本</h3>
                    <p className="text-xs text-olive/50 font-medium tracking-tight">记录你标记为重点学习的内容</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-olive/30 hover:text-red-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {favorites.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                    <BookMarked className="h-16 w-16 mb-4" />
                    <p className="font-bold">目前还没有收藏任何术语</p>
                    <p className="text-sm">在学习过程中点击心形按钮即可收藏</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {favorites.map((word, idx) => (
                      <div 
                        key={idx} 
                        className="group bg-card-front p-5 rounded-[24px] border border-olive/5 hover:border-olive/20 hover:shadow-lg transition-all flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-olive">{word.en}</span>
                            <span className="text-xs text-accent-gold italic font-serif">{word.phonetic}</span>
                          </div>
                          <span className="text-sm text-olive/60">{word.cn}</span>
                          <span className="text-[10px] uppercase tracking-widest text-olive/30 font-bold mt-1">{word.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-olive/20">
                           <button 
                            onClick={() => { setIsFlipped(false); setCurrentIndex(fullVocab.findIndex(w => w.en === word.en)); setIsModalOpen(false); }}
                            className="p-2 hover:bg-olive hover:text-white rounded-full transition-all"
                            title="前往学习"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => removeFavorite(word.en)}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all"
                            title="移除"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Vocabulary Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute inset-0 bg-[#2d2d2a]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-natural-bg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-olive/20"
            >
              <div className="p-8 border-b border-olive/10 flex justify-between items-center bg-card-front">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-gold text-white rounded-xl shadow-inner">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-olive">管理自定义词库</h3>
                    <p className="text-xs text-olive/50 font-medium tracking-tight">添加、编辑或删除你自己的 C++ 词条</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { playSound('click'); setEditingWord({ en: '', cn: '', category: '自定义', phonetic: '', example: '' }); }}
                    className="px-4 py-2 bg-olive text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-olive-dark transition-all shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    新增卡片
                  </button>
                  <button 
                    onClick={() => setIsCustomModalOpen(false)}
                    className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-olive/30 hover:text-red-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {editingWord ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card-front p-8 rounded-[32px] border-2 border-olive/10 shadow-inner"
                  >
                    <h4 className="text-lg font-bold text-olive mb-6 flex items-center gap-2">
                       {customVocab.some(w => w.en === editingWord.en) ? '编辑卡片' : '创建新卡片'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a196]">英文术语 (EN)</label>
                        <input 
                          type="text" 
                          value={editingWord.en}
                          onChange={e => setEditingWord({...editingWord, en: e.target.value})}
                          placeholder="例如: unique_ptr"
                          className="w-full px-4 py-3 bg-white/50 border-2 border-olive/5 rounded-xl focus:border-olive focus:bg-white transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a196]">中文释义 (CN)</label>
                        <input 
                          type="text" 
                          value={editingWord.cn}
                          onChange={e => setEditingWord({...editingWord, cn: e.target.value})}
                          placeholder="例如: 独占智能指针"
                          className="w-full px-4 py-3 bg-white/50 border-2 border-olive/5 rounded-xl focus:border-olive focus:bg-white transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a196]">分类 (Category)</label>
                        <input 
                          type="text" 
                          value={editingWord.category}
                          onChange={e => setEditingWord({...editingWord, category: e.target.value})}
                          placeholder="例如: 内存管理"
                          className="w-full px-4 py-3 bg-white/50 border-2 border-olive/5 rounded-xl focus:border-olive focus:bg-white transition-all outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a196]">音标 (Phonetic - 可选)</label>
                        <input 
                          type="text" 
                          value={editingWord.phonetic}
                          onChange={e => setEditingWord({...editingWord, phonetic: e.target.value})}
                          placeholder="例如: /juˈniːk ˌpiːtiˈɑːr/"
                          className="w-full px-4 py-3 bg-white/50 border-2 border-olive/5 rounded-xl focus:border-olive focus:bg-white transition-all outline-none font-serif italic"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a196]">示例代码 (Example Code - 可选)</label>
                        <textarea 
                          value={editingWord.example}
                          onChange={e => setEditingWord({...editingWord, example: e.target.value})}
                          placeholder="输入一段 C++ 代码示例..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white/50 border-2 border-olive/5 rounded-xl focus:border-olive focus:bg-white transition-all outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                      <button 
                        onClick={() => setEditingWord(null)}
                        className="px-6 py-2 rounded-xl font-bold text-olive/40 hover:text-olive transition-colors"
                      >
                        取消
                      </button>
                      <button 
                        onClick={() => {
                          if (!editingWord.en || !editingWord.cn) {
                             alert('英文术语和中文释义不能为空');
                             return;
                          }
                          playSound('success');
                          const existingIdx = customVocab.findIndex(w => w.en === editingWord.en);
                          if (existingIdx !== -1) {
                            const newVocab = [...customVocab];
                            newVocab[existingIdx] = editingWord;
                            setCustomVocab(newVocab);
                          } else {
                            setCustomVocab([...customVocab, editingWord]);
                          }
                          setEditingWord(null);
                        }}
                        className="px-10 py-2 bg-olive text-white rounded-xl font-bold shadow-lg hover:bg-olive-dark transition-all flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        保存卡片
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {customVocab.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                        <Settings className="h-16 w-16 mb-4" />
                        <p className="font-bold">目前还没有添加任何自定义词条</p>
                        <p className="text-sm">点击右上角的按钮开始构建你的专属词库</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {customVocab.map((word, idx) => (
                          <div 
                            key={idx} 
                            className="group bg-card-front p-5 rounded-[24px] border border-olive/5 hover:border-olive/20 hover:shadow-md transition-all flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-olive">{word.en}</span>
                                <span className="px-2 py-0.5 bg-accent-gold/10 text-accent-gold rounded-full text-[10px] font-bold uppercase tracking-wider">{word.category}</span>
                              </div>
                              <span className="text-sm text-olive/60 mt-0.5">{word.cn}</span>
                              {word.example && <span className="text-[10px] font-mono text-olive/30 mt-1 truncate max-w-[300px]">{word.example}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                onClick={() => { playSound('click'); setEditingWord(word); }}
                                className="p-2 text-olive/20 hover:text-olive hover:bg-olive/5 rounded-full transition-all"
                                title="编辑"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`确定要删除 "${word.en}" 吗？`)) {
                                    playSound('click');
                                    setCustomVocab(prev => prev.filter(w => w.en !== word.en));
                                    setFavorites(prev => prev.filter(w => w.en !== word.en));
                                  }
                                }}
                                className="p-2 text-olive/20 hover:text-red-500 hover:bg-red-500/5 rounded-full transition-all"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-8 text-[#a1a196] text-sm italic text-center">
        Mastering {fullVocab.length} C++ terms • Keep Growing
      </footer>
    </div>
  );
}
