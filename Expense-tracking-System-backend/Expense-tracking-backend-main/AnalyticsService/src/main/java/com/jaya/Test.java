package com.jaya;

import java.io.*;
import java.util.*;

class Test {

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);

        int input1 = sc.nextInt();
        int input2 = sc.nextInt();
        int input3 = sc.nextInt();

        Test t = new Test();
        int result = t.findkey(input1, input2, input3);
        System.out.println(result);

        sc.close();
    }

    public int findkey(int input1, int input2, int input3) {
        int[] largest = new int[3];
        int[] smallest = new int[3];

        int[] inputs = { input1, input2, input3 };

        for (int i = 0; i < 3; i++) {
            int n = inputs[i];
            int maxDigit = 0;
            int minDigit = 9;

            while (n > 0) {
                int d = n % 10;
                if (d > maxDigit) {
                    maxDigit = d;
                }
                if (d < minDigit) {
                    minDigit = d;
                }
                n /= 10;
            }

            largest[i] = maxDigit;
            smallest[i] = minDigit;
        }

        int largestSum = largest[0] + largest[1] + largest[2];
        int smallestSum = smallest[0] + smallest[1] + smallest[2];

        return largestSum - smallestSum;
    }
}